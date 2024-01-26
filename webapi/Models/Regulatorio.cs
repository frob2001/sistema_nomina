using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Regulatorio
{
    public int RegulatorioId { get; set; }

    public int GrupoId { get; set; }

    public int ClienteId { get; set; }

    public int OficinaTramitante { get; set; }

    public int Abogado { get; set; }

    public string CodigoPais { get; set; } = null!;

    public string Titulo { get; set; } = null!;

    public string ReferenciaInterna { get; set; } = null!;

    public string? Registro { get; set; }

    public DateTime? FechaRegistro { get; set; }

    public DateTime? FechaVencimiento { get; set; }

    public string EstadoId { get; set; } = null!;

    public bool? Activo { get; set; }

    public virtual Abogado AbogadoNavigation { get; set; } = null!;

    public virtual Cliente Cliente { get; set; } = null!;

    public virtual Pai CodigoPaisNavigation { get; set; } = null!;

    public virtual Estado Estado { get; set; } = null!;

    public virtual Grupo Grupo { get; set; } = null!;

    public virtual Cliente OficinaTramitanteNavigation { get; set; } = null!;

    public virtual ICollection<RegulatorioFabricante> RegulatorioFabricantes { get; set; } = new List<RegulatorioFabricante>();

    public virtual ICollection<ContactosCliente> Contactos { get; set; } = new List<ContactosCliente>();

    public virtual ICollection<Propietario> Propietarios { get; set; } = new List<Propietario>();

    public virtual ICollection<Referencium> Referencia { get; set; } = new List<Referencium>();
}
