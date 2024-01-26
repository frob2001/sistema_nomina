using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class ContactosCliente
{
    public int ContactoId { get; set; }

    public int ClienteId { get; set; }

    public int? TipoContactoClienteId { get; set; }

    public string? Nombre { get; set; }

    public string? Apellido { get; set; }

    public string? Email { get; set; }

    public string? Telefono { get; set; }

    public string? Cargo { get; set; }

    public string? CodigoIdioma { get; set; }

    public virtual Cliente Cliente { get; set; } = null!;

    public virtual Idioma? CodigoIdiomaNavigation { get; set; }

    public virtual TipoContactoCliente? TipoContactoCliente { get; set; }

    public virtual ICollection<Marca> Marcas { get; set; } = new List<Marca>();

    public virtual ICollection<Patente> Patentes { get; set; } = new List<Patente>();

    public virtual ICollection<Regulatorio> Regulatorios { get; set; } = new List<Regulatorio>();
}
