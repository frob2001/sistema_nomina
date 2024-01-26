using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class EstadoInfraccion
{
    public string EstadoId { get; set; } = null!;

    public int InfraccionId { get; set; }

    public virtual Estado Estado { get; set; } = null!;
}
