using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class TipoEstado
{
    public string TipoEstadoId { get; set; } = null!;

    public string NombreEspanol { get; set; } = null!;

    public string NombreIngles { get; set; } = null!;

    public virtual ICollection<Estado> Estados { get; set; } = new List<Estado>();
}
