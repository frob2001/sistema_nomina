using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using Microsoft.AspNetCore.Authorization;

namespace webapi.Controllers
{
    [Authorize]
    [Route("ContactosCliente")]
    [ApiController]
    public class ContactosClientesController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public ContactosClientesController(KattionDataBaseContext context)
        {
            _context = context;
        }

        public class ContactosClienteDTO
        {
            public int ContactoId { get; set; }
            public int ClienteId { get; set; }
            public string Nombre { get; set; }
            public string Apellido { get; set; }
            public string Email { get; set; }
            public string Telefono { get; set; }
            public string Cargo { get; set; }
            public IdiomaDTO Idioma { get; set; }
            public TipoContactoDTO TipoContacto { get; set; }
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContactosClienteDTO>>> GetContactosClientes()
        {
            var contactosClientes = await _context.ContactosClientes
                .Select(cc => new ContactosClienteDTO
                {
                    ContactoId = cc.ContactoId,
                    ClienteId = cc.ClienteId,
                    Nombre = cc.Nombre,
                    Apellido = cc.Apellido,
                    Email = cc.Email,
                    Telefono = cc.Telefono,
                    Cargo = cc.Cargo,
                    TipoContacto = new TipoContactoDTO
                    {
                        TipoContactoClienteId = cc.TipoContactoCliente.TipoContactoClienteId,
                        Nombre = cc.TipoContactoCliente.Nombre
                    },
                    Idioma = new IdiomaDTO
                    {
                        CodigoIdioma = cc.CodigoIdioma,
                        Nombre = cc.CodigoIdiomaNavigation.Nombre
                    }
                })
                .ToListAsync();

            return contactosClientes;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ContactosClienteDTO>> GetContactosCliente(int id)
        {
            var contactosCliente = await _context.ContactosClientes
                .Where(cc => cc.ContactoId == id)
                .Select(cc => new ContactosClienteDTO
                {
                    ContactoId = cc.ContactoId,
                    ClienteId = cc.ClienteId,
                    Nombre = cc.Nombre,
                    Apellido = cc.Apellido,
                    Email = cc.Email,
                    Telefono = cc.Telefono,
                    Cargo = cc.Cargo,
                    TipoContacto = new TipoContactoDTO
                    {
                        TipoContactoClienteId = cc.TipoContactoCliente.TipoContactoClienteId,
                        Nombre = cc.TipoContactoCliente.Nombre
                    },
                    Idioma = new IdiomaDTO
                    {
                        CodigoIdioma = cc.CodigoIdioma,
                        Nombre = cc.CodigoIdiomaNavigation.Nombre
                    }
                })
                .FirstOrDefaultAsync(); 

            if (contactosCliente == null)
            {
                return NotFound();
            }

            return contactosCliente;
        }

        [HttpGet("Cliente/{clienteId}")]
        public async Task<ActionResult<IEnumerable<ContactosClienteDTO>>> GetContactosClientesByClienteId(int clienteId)
        {
            var contactosClientes = await _context.ContactosClientes
                .Where(cc => cc.ClienteId == clienteId)
                .Select(cc => new ContactosClienteDTO
                {
                    ContactoId = cc.ContactoId,
                    ClienteId = cc.ClienteId,
                    Nombre = cc.Nombre,
                    Apellido = cc.Apellido,
                    Email = cc.Email,
                    Telefono = cc.Telefono,
                    Cargo = cc.Cargo,
                    TipoContacto = new TipoContactoDTO
                    {
                        TipoContactoClienteId = cc.TipoContactoCliente.TipoContactoClienteId,
                        Nombre = cc.TipoContactoCliente.Nombre
                    },
                    Idioma = new IdiomaDTO
                    {
                        CodigoIdioma = cc.CodigoIdioma,
                        Nombre = cc.CodigoIdiomaNavigation.Nombre
                    }
                })
                .ToListAsync();

            return contactosClientes;
        }


        public class ContactosClienteInputDTO
        {
            public int ClienteId { get; set; }
            public int TipoContactoClienteId { get; set; }
            public string Nombre { get; set; }
            public string Apellido { get; set; }
            public string Email { get; set; }
            public string Telefono { get; set; }
            public string Cargo { get; set; }
            public string CodigoIdioma { get; set; }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutContactosCliente(int id, ContactosClienteInputDTO contactosClienteInputDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var contactosCliente = await _context.ContactosClientes.FindAsync(id);
            if (contactosCliente == null)
            {
                return NotFound();
            }

            contactosCliente.ClienteId = contactosClienteInputDTO.ClienteId;
            contactosCliente.TipoContactoClienteId = contactosClienteInputDTO.TipoContactoClienteId;
            contactosCliente.Nombre = contactosClienteInputDTO.Nombre;
            contactosCliente.Apellido = contactosClienteInputDTO.Apellido;
            contactosCliente.Email = contactosClienteInputDTO.Email;
            contactosCliente.Telefono = contactosClienteInputDTO.Telefono;
            contactosCliente.Cargo = contactosClienteInputDTO.Cargo;
            contactosCliente.CodigoIdioma = contactosClienteInputDTO.CodigoIdioma;

            _context.Entry(contactosCliente).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ContactosClienteExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }


        [HttpPost]
        public async Task<ActionResult<ContactosCliente>> PostContactosCliente(ContactosClienteInputDTO ContactosClienteInputDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var contactosCliente = new ContactosCliente
            {
                ClienteId = ContactosClienteInputDTO.ClienteId,
                TipoContactoClienteId = ContactosClienteInputDTO.TipoContactoClienteId,
                Nombre = ContactosClienteInputDTO.Nombre,
                Apellido = ContactosClienteInputDTO.Apellido,
                Email = ContactosClienteInputDTO.Email,
                Telefono = ContactosClienteInputDTO.Telefono,
                Cargo = ContactosClienteInputDTO.Cargo,
                CodigoIdioma = ContactosClienteInputDTO.CodigoIdioma
            };

            _context.ContactosClientes.Add(contactosCliente);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetContactosCliente", new { id = contactosCliente.ContactoId }, contactosCliente);
        }


        // DELETE: api/ContactosClientes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContactosCliente(int id)
        {
            if (_context.ContactosClientes == null)
            {
                return NotFound();
            }
            var contactosCliente = await _context.ContactosClientes.FindAsync(id);
            if (contactosCliente == null)
            {
                return NotFound();
            }

            _context.ContactosClientes.Remove(contactosCliente);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ContactosClienteExists(int id)
        {
            return (_context.ContactosClientes?.Any(e => e.ContactoId == id)).GetValueOrDefault();
        }
    }
}
