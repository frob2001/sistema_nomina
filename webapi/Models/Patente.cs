using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Patente
{
    public int PatenteId { get; set; }

    public int TipoPatenteId { get; set; }

    public int ClienteId { get; set; }

    public int OficinaTramitante { get; set; }

    public int Abogado { get; set; }

    public string? AbogadoInternacional { get; set; }

    public string CodigoPais { get; set; } = null!;

    public string TituloEspanol { get; set; } = null!;

    public string TituloIngles { get; set; } = null!;

    public string? Resumen { get; set; }

    public string ReferenciaInterna { get; set; } = null!;

    public string? Caja { get; set; }

    public string? Registro { get; set; }

    public DateTime? FechaRegistro { get; set; }

    public string? Publicacion { get; set; }

    public DateTime? FechaPublicacion { get; set; }

    public string? Certificado { get; set; }

    public DateTime? Vencimiento { get; set; }

    public string? PctSolicitud { get; set; }

    public DateTime? FechaPctSolicitud { get; set; }

    public string? PctPublicacion { get; set; }

    public DateTime? FechaPctPublicacion { get; set; }

    public bool? PagoAnualidad { get; set; }

    public DateTime? PagoAnualidadDesde { get; set; }

    public DateTime? PagoAnualidadHasta { get; set; }

    public bool? Activo { get; set; }

    public virtual Abogado AbogadoNavigation { get; set; } = null!;

    public virtual Cliente Cliente { get; set; } = null!;

    public virtual Pai CodigoPaisNavigation { get; set; } = null!;

    public virtual Cliente OficinaTramitanteNavigation { get; set; } = null!;

    public virtual ICollection<PagosPatente> PagosPatentes { get; set; } = new List<PagosPatente>();

    public virtual ICollection<PrioridadPatente> PrioridadPatentes { get; set; } = new List<PrioridadPatente>();

    public virtual ICollection<PublicacionPatente> PublicacionPatentes { get; set; } = new List<PublicacionPatente>();

    public virtual TipoPatente TipoPatente { get; set; } = null!;

    public virtual ICollection<ContactosCliente> Contactos { get; set; } = new List<ContactosCliente>();

    public virtual ICollection<Inventor> Inventors { get; set; } = new List<Inventor>();

    public virtual ICollection<Propietario> Propietarios { get; set; } = new List<Propietario>();

    public virtual ICollection<Referencium> Referencia { get; set; } = new List<Referencium>();
    public virtual ICollection<EstadoPatente> EstadoPatentes { get; set; } = new List<EstadoPatente>();
}
