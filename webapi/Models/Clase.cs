using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class Clase
{
    public int Codigo { get; set; }

    public string? DescripcionEspanol { get; set; }

    public string? DescripcionIngles { get; set; }

    public virtual ICollection<Evento2> Evento2s { get; set; } = new List<Evento2>();

    public virtual ICollection<Infraccion> InfraccionClaseInfractorNavigations { get; set; } = new List<Infraccion>();

    public virtual ICollection<Infraccion> InfraccionClaseMarcaNavigations { get; set; } = new List<Infraccion>();

    public virtual ICollection<MarcaClase> MarcaClases { get; set; } = new List<MarcaClase>();

    public virtual ICollection<MarcaOpuestum> MarcaOpuesta { get; set; } = new List<MarcaOpuestum>();
}
