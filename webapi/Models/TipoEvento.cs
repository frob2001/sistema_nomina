using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class TipoEvento
{
    public int TipoEventoId { get; set; }

    public string Nombre { get; set; } = null!;

    public string TablaEvento { get; set; } = null!;

    public virtual ICollection<Evento1> Evento1s { get; set; } = new List<Evento1>();

    public virtual ICollection<Evento2> Evento2s { get; set; } = new List<Evento2>();

    public virtual ICollection<Evento3> Evento3s { get; set; } = new List<Evento3>();

    public virtual ICollection<Evento4> Evento4s { get; set; } = new List<Evento4>();
}
