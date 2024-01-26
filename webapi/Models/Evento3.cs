using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Evento3
{
    public int EventoId { get; set; }

    public int TipoEventoId { get; set; }

    public string EstadoCodigo { get; set; } = null!;

    public DateTime? FechaVigenciaDesde { get; set; }

    public DateTime? FechaVigenciaHasta { get; set; }

    public string? Solicitud { get; set; }

    public string? Registro { get; set; }

    public DateTime? FechaSolicitud { get; set; }

    public DateTime? FechaRegistro { get; set; }

    public virtual Estado EstadoCodigoNavigation { get; set; } = null!;

    public virtual TipoEvento TipoEvento { get; set; } = null!;
}
