using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class TipoInfraccion
{
    public int TipoInfraccionId { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Infraccion> Infraccions { get; set; } = new List<Infraccion>();
}
