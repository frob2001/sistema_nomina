using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class InstanciasRecordatorio
{
    public int InstanciasRecordatorioId { get; set; }

    public int? RecordatorioId { get; set; }

    public DateTime? Fecha { get; set; }

    public bool? Activo { get; set; }

    public virtual Recordatorio? Recordatorio { get; set; }
}
