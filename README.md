# IgniSalud - Plataforma de Gestión de Salud

IgniSalud es una aplicación web integral diseñada para la gestión de citas médicas, triaje de pacientes y administración de agendas para profesionales de la salud. Este proyecto fue desarrollado como parte del Taller de Programación para la asignatura de Proyecto de Título.

## Características principales:

- **Gestión de Citas**: Sistema de reserva de horas para pacientes.
- **Dashboard Médico**: Agenda diaria y gestión de consultas en tiempo real.
- **Triaje con IA**: Análisis preliminar de síntomas (integración futura/en desarrollo).
- **Arquitectura Robusta**: Backend en Node.js y Frontend en React.
- **Contenerización**: Despliegue simplificado mediante Docker.

## Tecnologías utilizadas:

- **Frontend**: React.js, Vite, Vanilla CSS.
- **Backend**: Node.js, Express, Prisma ORM.
- **Base de Datos**: PostgreSQL.
- **Infraestructura**: Docker, Docker Compose.

## Requisitos previos
- Docker y Docker Compose instalados.
- Node.js (opcional, para desarrollo local fuera de Docker).

## Instalación y ejecución
- **Clona el repositorio**: 
 1) `git clone https://github.com/ClaudioRobledoV/Proyecto_IgniSalud`
 2) `cd Proyecto_IgniSalud`

- **Levanta los servicios con Docker Compose**:
 1) `docker-compose up --build`

## Accede a la aplicación:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## Estructura del Proyecto
- **/frontend**: Código fuente de la interfaz de usuario.
- **/backend**: Lógica de servidor, API y modelos de datos.
- **docker-compose.yml**: Configuración de orquestación de servicios.
