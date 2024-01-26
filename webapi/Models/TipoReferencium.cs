using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class TipoReferencium
{
    public int TipoReferenciaId { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Referencium> Referencia { get; set; } = new List<Referencium>();
}
