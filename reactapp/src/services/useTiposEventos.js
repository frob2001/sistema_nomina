const useTiposEventos = () => {

    const tiposEventosMarcas = [
        { tipoEvento: 'Transferencia', tablaEvento: 'evento4', tipoEventoId: 6 },
        { tipoEvento: 'Licencia', tablaEvento: 'evento4', tipoEventoId: 7 },
        { tipoEvento: 'Cambio de nombre', tablaEvento: 'evento4', tipoEventoId: 8 },
        { tipoEvento: 'Cambio de domicilio', tablaEvento: 'evento4', tipoEventoId: 9 },
        { tipoEvento: 'Fusión', tablaEvento: 'evento4', tipoEventoId: 10 },
        { tipoEvento: 'Renovación', tablaEvento: 'evento3', tipoEventoId: 5 },
        { tipoEvento: 'Cancelación', tablaEvento: 'evento2', tipoEventoId: 2 },
        { tipoEvento: 'Nulidad', tablaEvento: 'evento2', tipoEventoId: 3 },
        { tipoEvento: 'Oposición', tablaEvento: 'evento2', tipoEventoId: 4 },
        { tipoEvento: 'Otro', tablaEvento: 'evento1', tipoEventoId: 1 },
    ]

    const tiposEventosPatentes = [
        { tipoEvento: 'Transferencia', tablaEvento: 'evento4', tipoEventoId: 6 },
        { tipoEvento: 'Licencia', tablaEvento: 'evento4', tipoEventoId: 7 },
        { tipoEvento: 'Cambio de nombre', tablaEvento: 'evento4', tipoEventoId: 8 },
        { tipoEvento: 'Cambio de domicilio', tablaEvento: 'evento4', tipoEventoId: 9 },
        { tipoEvento: 'Fusión', tablaEvento: 'evento4', tipoEventoId: 10 },
        { tipoEvento: 'Renovación', tablaEvento: 'evento3', tipoEventoId: 5 },
        { tipoEvento: 'Otro', tablaEvento: 'evento1', tipoEventoId: 1 },
    ]

    const tiposEventosAcciones = [
        { tipoEvento: 'Otro', tablaEvento: 'evento1', tipoEventoId: 1 },
    ]

    return {
        tiposEventosMarcas,
        tiposEventosPatentes,
        tiposEventosAcciones
    };
};

export { useTiposEventos };