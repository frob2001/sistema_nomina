using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class MarcaOpuestum
{
    public int MarcaOpuestaId { get; set; }

    public string Denominacion { get; set; } = null!;

    public int? Clase { get; set; }

    public string? CodigoPais { get; set; }

    public string? Solicitud { get; set; }

    public DateTime? FechaSolicitud { get; set; }

    public string? Registro { get; set; }

    public DateTime? FechaRegistro { get; set; }

    public string? Propietario { get; set; }

    public string? Agente { get; set; }

    public int? Gaceta { get; set; }

    public DateTime? Fecha { get; set; }

    public virtual ICollection<AccionTercero> AccionTerceros { get; set; } = new List<AccionTercero>();

    public virtual Clase? ClaseNavigation { get; set; }

    public virtual Pai? CodigoPaisNavigation { get; set; }

    public virtual Gacetum? GacetaNavigation { get; set; }
}
