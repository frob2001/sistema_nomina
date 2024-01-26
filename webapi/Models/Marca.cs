using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Marca
{
    public int MarcaId { get; set; }

    public int TipoSistemaMarcaId { get; set; }

    public int ClienteId { get; set; }

    public int OficinaTramitante { get; set; }

    public int Abogado { get; set; }

    public string Signo { get; set; } = null!;

    public int TipoSignoMarcaId { get; set; }

    public int TipoMarcaId { get; set; }

    public string ReferenciaInterna { get; set; } = null!;

    public DateTime? PrimerUso { get; set; }

    public DateTime? PruebaUso { get; set; }

    public string? Caja { get; set; }

    public bool? Comparacion { get; set; }

    public string? Solicitud { get; set; }

    public DateTime? FechaSolicitud { get; set; }

    public string? Registro { get; set; }

    public DateTime? FechaRegistro { get; set; }

    public string? Certificado { get; set; }

    public DateTime? FechaCertificado { get; set; }

    public DateTime? Vencimiento { get; set; }

    public string? AbogadoInternacional { get; set; }

    public bool TieneFigura { get; set; }

    public bool? Activo { get; set; }

    public virtual Abogado AbogadoNavigation { get; set; } = null!;

    public virtual Cliente Cliente { get; set; } = null!;

    public virtual ICollection<Infraccion> Infraccions { get; set; } = new List<Infraccion>();

    public virtual ICollection<MarcaBase> MarcaBases { get; set; } = new List<MarcaBase>();

    public virtual ICollection<MarcaClase> MarcaClases { get; set; } = new List<MarcaClase>();

    public virtual Cliente OficinaTramitanteNavigation { get; set; } = null!;

    public virtual ICollection<PrioridadMarca> PrioridadMarcas { get; set; } = new List<PrioridadMarca>();

    public virtual ICollection<PublicacionMarca> PublicacionMarcas { get; set; } = new List<PublicacionMarca>();

    public virtual TipoMarca TipoMarca { get; set; } = null!;

    public virtual TipoSignoMarca TipoSignoMarca { get; set; } = null!;

    public virtual TipoSistemaMarca TipoSistemaMarca { get; set; } = null!;

    public virtual ICollection<Pai> CodigoPais { get; set; } = new List<Pai>();

    public virtual ICollection<ContactosCliente> Contactos { get; set; } = new List<ContactosCliente>();

    public virtual ICollection<Propietario> Propietarios { get; set; } = new List<Propietario>();

    public virtual ICollection<Referencium> Referencia { get; set; } = new List<Referencium>();
    public virtual ICollection<EstadoMarca> EstadoMarcas { get; set; } = new List<EstadoMarca>();
}
