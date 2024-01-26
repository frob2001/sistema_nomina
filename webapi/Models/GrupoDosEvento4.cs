using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class GrupoDosEvento4
{
    public int GrupoDosEvento4Id { get; set; }

    public int? PropietarioId { get; set; }

    public int? EventoId { get; set; }

    public virtual Evento4? Evento { get; set; }

    public virtual Propietario? Propietario { get; set; }
}
