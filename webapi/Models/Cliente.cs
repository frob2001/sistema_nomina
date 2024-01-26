using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Cliente
{
    public int ClienteId { get; set; }

    public string? Nombre { get; set; }

    public string? CodigoPais { get; set; }

    public string? Ciudad { get; set; }

    public string? EstadoProvincia { get; set; }

    public string? CodigoIdioma { get; set; }

    public string? Direccion { get; set; }

    public string? Web { get; set; }

    public string? Telefono { get; set; }

    public string? Email { get; set; }

    public string? Notas { get; set; }

    public string? UsuarioWeb { get; set; }

    public string? ClaveWeb { get; set; }

    public virtual ICollection<AccionTercero> AccionTerceroClientes { get; set; } = new List<AccionTercero>();

    public virtual ICollection<AccionTercero> AccionTerceroOficinaTramitanteNavigations { get; set; } = new List<AccionTercero>();

    public virtual Idioma? CodigoIdiomaNavigation { get; set; }

    public virtual Pai? CodigoPaisNavigation { get; set; }

    public virtual ICollection<ContactosCliente> ContactosClientes { get; set; } = new List<ContactosCliente>();

    public virtual ICollection<Infraccion> Infraccions { get; set; } = new List<Infraccion>();

    public virtual ICollection<Marca> MarcaClientes { get; set; } = new List<Marca>();

    public virtual ICollection<Marca> MarcaOficinaTramitanteNavigations { get; set; } = new List<Marca>();

    public virtual ICollection<Patente> PatenteClientes { get; set; } = new List<Patente>();

    public virtual ICollection<Patente> PatenteOficinaTramitanteNavigations { get; set; } = new List<Patente>();

    public virtual ICollection<Regulatorio> RegulatorioClientes { get; set; } = new List<Regulatorio>();

    public virtual ICollection<Regulatorio> RegulatorioOficinaTramitanteNavigations { get; set; } = new List<Regulatorio>();
}
