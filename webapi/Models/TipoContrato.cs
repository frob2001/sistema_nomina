using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class TipoContrato
{
    public int TipoContratoId { get; set; }

    public string? Nombre { get; set; }

    public virtual ICollection<Empleado> Empleados { get; set; } = new List<Empleado>();
}
