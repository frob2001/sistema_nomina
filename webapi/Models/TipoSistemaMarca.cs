using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class TipoSistemaMarca
{
    public int TipoSistemaMarcaId { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Marca> Marcas { get; set; } = new List<Marca>();
}
