using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class MarcaClase
{
    public int CodigoClase { get; set; }

    public int MarcaId { get; set; }

    public string? CoberturaEspanol { get; set; }

    public string? CoberturaIngles { get; set; }

    public virtual Clase CodigoClaseNavigation { get; set; } = null!;

    public virtual Marca Marca { get; set; } = null!;
}
