using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Recordatorio
{
    public int RecordatorioId { get; set; }

    public string? TablaConexion { get; set; }

    public int? IdConexion { get; set; }

    public string? Descripcion { get; set; }

    public virtual ICollection<InstanciasRecordatorio> InstanciasRecordatorios { get; set; } = new List<InstanciasRecordatorio>();

    public virtual ICollection<Usuario> IdUsuarios { get; set; } = new List<Usuario>();
}
