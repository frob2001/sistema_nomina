using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Inventor
{
    public int InventorId { get; set; }

    public string Nombre { get; set; } = null!;

    public string Apellido { get; set; } = null!;

    public string Direccion { get; set; } = null!;

    public string CodigoPais { get; set; } = null!;

    public virtual Pai CodigoPaisNavigation { get; set; } = null!;

    public virtual ICollection<Patente> Patentes { get; set; } = new List<Patente>();
}
