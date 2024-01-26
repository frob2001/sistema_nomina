using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class EstadoPatente
{
    public string EstadoId { get; set; } = null!;

    public int PatenteId { get; set; }

    public virtual Estado Estado { get; set; } = null!;
}
