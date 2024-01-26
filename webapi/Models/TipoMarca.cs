using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class TipoMarca
{
    public int TipoMarcaId { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Marca> Marcas { get; set; } = new List<Marca>();
}
