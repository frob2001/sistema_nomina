using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class EstadoMarca
{
    public string EstadoId { get; set; } = null!;

    public int MarcaId { get; set; }

    public virtual Estado Estado { get; set; } = null!;
}
