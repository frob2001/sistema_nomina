using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class GrupoUnoEvento4
{
    public int GrupoUnoEvento4Id { get; set; }

    public int? PropietarioId { get; set; }

    public int? EventoId { get; set; }

    public virtual Evento4? Evento { get; set; }

    public virtual Propietario? Propietario { get; set; }
}
