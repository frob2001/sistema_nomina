using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Ocupacion
{
    public int OcupacionId { get; set; }

    public string? Nombre { get; set; }

    public virtual ICollection<Empleado> Empleados { get; set; } = new List<Empleado>();
}
