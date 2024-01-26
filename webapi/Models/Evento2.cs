using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Evento2
{
    public int EventoId { get; set; }

    public int TipoEventoId { get; set; }

    public string EstadoCodigo { get; set; } = null!;

    public string? Propietario { get; set; }

    public string? Agente { get; set; }

    public string? MarcaOpuesta { get; set; }

    public string? Registro { get; set; }

    public DateTime? FechaRegistro { get; set; }

    public int? ClaseId { get; set; }

    public virtual Clase? Clase { get; set; }

    public virtual Estado EstadoCodigoNavigation { get; set; } = null!;

    public virtual TipoEvento TipoEvento { get; set; } = null!;
}
