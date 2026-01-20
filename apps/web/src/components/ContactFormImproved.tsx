'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, type ContactFormData } from '../lib/validations';
import { useState } from 'react';

export default function ContactFormImproved() {
  const [status, setStatus] = useState<null | 'sending' | 'ok' | 'error'>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error('Error al enviar');
      
      setStatus('ok');
      reset();
      
      setTimeout(() => setStatus(null), 5000);
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="contact-form glass-panel" style={{ padding: '2rem' }}>
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
          Nombre completo
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="form-input"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: `1px solid ${errors.name ? '#ef4444' : 'var(--bloom-border)'}`,
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'inherit',
            fontSize: '1rem',
          }}
          placeholder="Juan Pérez"
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" className="form-error" style={{ 
            color: '#ef4444', 
            fontSize: '0.875rem', 
            marginTop: '0.5rem' 
          }}>
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="form-input"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: `1px solid ${errors.email ? '#ef4444' : 'var(--bloom-border)'}`,
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'inherit',
            fontSize: '1rem',
          }}
          placeholder="juan@ejemplo.com"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="form-error" style={{ 
            color: '#ef4444', 
            fontSize: '0.875rem', 
            marginTop: '0.5rem' 
          }}>
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
          Teléfono
        </label>
        <input
          id="phone"
          type="tel"
          {...register('phone')}
          className="form-input"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: `1px solid ${errors.phone ? '#ef4444' : 'var(--bloom-border)'}`,
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'inherit',
            fontSize: '1rem',
          }}
          placeholder="555-1234-5678"
          aria-invalid={errors.phone ? "true" : "false"}
          aria-describedby={errors.phone ? "phone-error" : undefined}
        />
        {errors.phone && (
          <p id="phone-error" className="form-error" style={{ 
            color: '#ef4444', 
            fontSize: '0.875rem', 
            marginTop: '0.5rem' 
          }}>
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
          Mensaje
        </label>
        <textarea
          id="message"
          {...register('message')}
          className="form-input"
          rows={5}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: `1px solid ${errors.message ? '#ef4444' : 'var(--bloom-border)'}`,
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'inherit',
            fontSize: '1rem',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
          placeholder="Cuéntanos cómo podemos ayudarte..."
          aria-invalid={errors.message ? "true" : "false"}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && (
          <p id="message-error" className="form-error" style={{ 
            color: '#ef4444', 
            fontSize: '0.875rem', 
            marginTop: '0.5rem' 
          }}>
            {errors.message.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bloom-button"
        style={{
          width: '100%',
          padding: '0.875rem',
          fontSize: '1rem',
          fontWeight: 600,
          opacity: isSubmitting ? 0.6 : 1,
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
        }}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
      </button>

      {status === 'ok' && (
        <div 
          className="alert alert-success"
          role="alert"
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '12px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#22c55e',
          }}
        >
          ✓ ¡Mensaje enviado con éxito! Te responderemos pronto.
        </div>
      )}

      {status === 'error' && (
        <div 
          className="alert alert-error"
          role="alert"
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
          }}
        >
          ✗ Error al enviar el mensaje. Por favor, inténtalo de nuevo.
        </div>
      )}
    </form>
  );
}
