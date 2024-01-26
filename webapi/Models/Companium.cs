using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Companium
{
    public int CompaniaId { get; set; }

    public string? Nombre { get; set; }

    public virtual ICollection<Empleado> Empleados { get; set; } = new List<Empleado>();

    public virtual ICollection<MovimientosPlanilla> MovimientosPlanillas { get; set; } = new List<MovimientosPlanilla>();

    public virtual ICollection<RolPago> RolPagos { get; set; } = new List<RolPago>();
}
