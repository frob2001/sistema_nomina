using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class TipoPatente
{
    public int TipoPatenteId { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Patente> Patentes { get; set; } = new List<Patente>();
}
