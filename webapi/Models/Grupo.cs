using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Grupo
{
    public int GrupoId { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Regulatorio> Regulatorios { get; set; } = new List<Regulatorio>();
}
