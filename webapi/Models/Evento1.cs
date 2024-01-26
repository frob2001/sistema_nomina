using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Evento1
{
    public int EventoId { get; set; }

    public int TipoEventoId { get; set; }

    public string EstadoCodigo { get; set; } = null!;

    public DateTime? Fecha { get; set; }

    public virtual Estado EstadoCodigoNavigation { get; set; } = null!;

    public virtual TipoEvento TipoEvento { get; set; } = null!;
}
