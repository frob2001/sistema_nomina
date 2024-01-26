using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Evento4
{
    public int EventoId { get; set; }

    public int TipoEventoId { get; set; }

    public string EstadoCodigo { get; set; } = null!;

    public string? Solicitud { get; set; }

    public string? Registro { get; set; }

    public DateTime? FechaSolicitud { get; set; }

    public DateTime? FechaRegistro { get; set; }

    public virtual Estado EstadoCodigoNavigation { get; set; } = null!;

    public virtual ICollection<GrupoDosEvento4> GrupoDosEvento4s { get; set; } = new List<GrupoDosEvento4>();

    public virtual ICollection<GrupoUnoEvento4> GrupoUnoEvento4s { get; set; } = new List<GrupoUnoEvento4>();

    public virtual TipoEvento TipoEvento { get; set; } = null!;
}
