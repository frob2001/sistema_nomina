using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class CasoInfraccion
{
    public int CasoInfraccionId { get; set; }

    public string? NumeroCasoInfraccion { get; set; }

    public virtual ICollection<Infraccion> Infraccions { get; set; } = new List<Infraccion>();
}
