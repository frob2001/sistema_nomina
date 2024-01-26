using System;
using System.Collections.Generic;

namespace webapi.Models;

public partial class ContactosClienteMarca
{
    public int ContactoId { get; set; }

    public int MarcaId { get; set; }

    public virtual ContactosCliente Contacto { get; set; } = null!;
}
