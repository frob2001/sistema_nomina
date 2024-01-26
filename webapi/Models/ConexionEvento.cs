using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class ConexionEvento
{
    public int ConexionEventoId { get; set; }

    public string TablaConexion { get; set; } = null!;

    public int IdConexion { get; set; }

    public string TablaConexionEvento { get; set; } = null!;

    public int IdEvento { get; set; }
}
