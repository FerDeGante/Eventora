import { google } from "googleapis";
import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";
import { getGoogleOAuthClient } from "../../lib/google";

const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

export const generateReservationICS = async (reservationId: string) => {
  const { clinicId } = assertTenant();
  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, clinicId },
    include: {
      service: true,
      branch: true,
      user: true,
    },
  });
  if (!reservation) throw new Error("Reservation not found");
  const start = reservation.startAt;
  const end = reservation.endAt;
  const uid = `${reservation.id}@eventora`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eventora//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:${reservation.service?.name ?? "Reserva"}`,
    `LOCATION:${reservation.branch?.name ?? ""}`,
    `DESCRIPTION:Reserva con Eventora` ,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return { ics: lines.join("\r\n"), reservation };
};

export const syncReservationToGoogle = async (reservationId: string, credentialId: string) => {
  const { clinicId } = assertTenant();
  const credential = await prisma.integrationCredential.findFirst({
    where: { id: credentialId, clinicId, provider: "GOOGLE_CALENDAR" },
  });
  if (!credential || !credential.accessToken) {
    throw new Error("Google integration not configured");
  }
  const { reservation } = await generateReservationICS(reservationId);
  const client = getGoogleOAuthClient();
  client.setCredentials({ access_token: credential.accessToken, refresh_token: credential.refreshToken });
  const calendar = google.calendar({ version: "v3", auth: client });
  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: reservation.service?.name ?? "Reserva",
      description: `Reserva Eventora con ${reservation.user?.name ?? reservation.user?.email ?? ""}`,
      start: { dateTime: reservation.startAt.toISOString() },
      end: { dateTime: reservation.endAt.toISOString() },
      location: reservation.branch?.name ?? "",
    },
  });
  return event.data;
};
