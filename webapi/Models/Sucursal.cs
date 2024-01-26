using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Sucursal
{
    public int SucursalId { get; set; }

    public string? Nombre { get; set; }

    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
