const cron = require('node-cron');
const { HorarioRecurrente, Evento } = require('../models');

const iniciarCronEventos = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('Revisando plantillas de horarios activas...');
        
        try {
            const plantillas = await HorarioRecurrente.findAll({
                where: { activo: true }
            });

            const hoy = new Date(); 
            const hoyString = hoy.toISOString().split('T')[0]; 

            for (const plantilla of plantillas) {
                let proximaFecha = new Date();
                
                if (plantilla.ultimaProyeccion) {
                    proximaFecha = new Date(plantilla.ultimaProyeccion);
                    if (plantilla.frecuencia === 'semanal') proximaFecha.setDate(proximaFecha.getDate() + 7);
                    if (plantilla.frecuencia === 'quincenal') proximaFecha.setDate(proximaFecha.getDate() + 14);
                    if (plantilla.frecuencia === 'mensual') proximaFecha.setMonth(proximaFecha.getMonth() + 1);
                } else {
                    const hoyDia = proximaFecha.getDay();
                    const dif = plantilla.diaSemana - hoyDia;
                    proximaFecha.setDate(proximaFecha.getDate() + (dif >= 0 ? dif : dif + 7));
                }

                const proximaFechaString = proximaFecha.toISOString().split('T')[0];

                if (proximaFechaString === hoyString) {
    
                    const [hInicio, mInicio] = plantilla.horaInicio.split(':');
                    const fechaInicioCompleta = new Date(proximaFecha);
                    fechaInicioCompleta.setHours(parseInt(hInicio), parseInt(mInicio), 0, 0);

                    const [hFin, mFin] = plantilla.horaFin.split(':');
                    const fechaFinCompleta = new Date(proximaFecha);
                    fechaFinCompleta.setHours(parseInt(hFin), parseInt(mFin), 0, 0);

                    await Evento.create({
                        nombre: plantilla.nombre,
                        fechaInicio: fechaInicioCompleta,
                        fechaFin: fechaFinCompleta,
                        horarioRecurrenteId: plantilla.id
                    });

                    await plantilla.update({
                        ultimaProyeccion: proximaFechaString
                    });

                    console.log(`Generado: "${plantilla.nombre}" asociado a la plantilla ID: ${plantilla.id}`);
                }
            }
        } catch (error) {
            console.error('Error en el generador de eventos:', error);
        }
    });
};

module.exports = { iniciarCronEventos };