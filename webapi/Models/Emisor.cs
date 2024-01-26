using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Emisor
{
    public int EmisorId { get; set; }

    public string? Nombre { get; set; }

    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
