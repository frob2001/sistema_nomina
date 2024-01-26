using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class ConexionComentario
{
    public int ConexionComentarioId { get; set; }

    public string TablaConexion { get; set; } = null!;

    public int IdConexion { get; set; }

    public DateTime Fecha { get; set; }

    public string Titulo { get; set; } = null!;

    public string Comentario { get; set; } = null!;

    public string? Usuario { get; set; }
}
