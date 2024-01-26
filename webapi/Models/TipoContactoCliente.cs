using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class TipoContactoCliente
{
    public int TipoContactoClienteId { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<ContactosCliente> ContactosClientes { get; set; } = new List<ContactosCliente>();
}
