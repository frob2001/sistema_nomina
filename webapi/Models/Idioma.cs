using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Idioma
{
    public string CodigoIdioma { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();

    public virtual ICollection<ContactosCliente> ContactosClientes { get; set; } = new List<ContactosCliente>();
}
