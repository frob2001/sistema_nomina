using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Usuario
{
    public int IdUsuario { get; set; }

    public string Correo { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string? Apellido { get; set; }

    public virtual ICollection<Recordatorio> Recordatorios { get; set; } = new List<Recordatorio>();
}
