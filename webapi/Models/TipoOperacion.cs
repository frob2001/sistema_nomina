using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class TipoOperacion
{
    public int TipoOperacionId { get; set; }

    public string? Nombre { get; set; }

    public virtual ICollection<MovimientosPlanilla> MovimientosPlanillas { get; set; } = new List<MovimientosPlanilla>();
}
