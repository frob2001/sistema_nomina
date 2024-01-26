using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class TipoAccion
{
    public int TipoAccionId { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<AccionTercero> AccionTerceros { get; set; } = new List<AccionTercero>();
}
