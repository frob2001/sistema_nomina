using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Pai
{
    public string CodigoPais { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();

    public virtual ICollection<Gacetum> Gaceta { get; set; } = new List<Gacetum>();

    public virtual ICollection<Infraccion> InfraccionCodigoPaisInfractorNavigations { get; set; } = new List<Infraccion>();

    public virtual ICollection<Infraccion> InfraccionCodigoPaisMarcaNavigations { get; set; } = new List<Infraccion>();

    public virtual ICollection<Inventor> Inventors { get; set; } = new List<Inventor>();

    public virtual ICollection<MarcaBase> MarcaBases { get; set; } = new List<MarcaBase>();

    public virtual ICollection<MarcaOpuestum> MarcaOpuesta { get; set; } = new List<MarcaOpuestum>();

    public virtual ICollection<Patente> Patentes { get; set; } = new List<Patente>();

    public virtual ICollection<PrioridadMarca> PrioridadMarcas { get; set; } = new List<PrioridadMarca>();

    public virtual ICollection<PrioridadPatente> PrioridadPatentes { get; set; } = new List<PrioridadPatente>();

    public virtual ICollection<Propietario> Propietarios { get; set; } = new List<Propietario>();

    public virtual ICollection<RegulatorioFabricante> RegulatorioFabricantes { get; set; } = new List<RegulatorioFabricante>();

    public virtual ICollection<Regulatorio> Regulatorios { get; set; } = new List<Regulatorio>();

    public virtual ICollection<Marca> Marcas { get; set; } = new List<Marca>();
}
