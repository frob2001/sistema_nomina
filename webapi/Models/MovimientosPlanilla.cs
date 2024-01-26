using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class MovimientosPlanilla
{
    public int MovimientoId { get; set; }

    public int? CompaniaId { get; set; }

    public int? EmpleadoId { get; set; }

    public int? ConceptoId { get; set; }

    public int? Ano { get; set; }

    public int? Mes { get; set; }

    public decimal? Importe { get; set; }

    public int? TipoOperacionId { get; set; }

    public virtual Companium? Compania { get; set; }

    public virtual Concepto? Concepto { get; set; }

    public virtual Empleado? Empleado { get; set; }

    public virtual TipoOperacion? TipoOperacion { get; set; }
}
