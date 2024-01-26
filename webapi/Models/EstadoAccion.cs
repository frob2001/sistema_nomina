using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class EstadoAccion
{
    public string EstadoId { get; set; } = null!;

    public int AccionTerceroId { get; set; }

    public virtual Estado Estado { get; set; } = null!;
}
