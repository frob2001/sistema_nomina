using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using Microsoft.AspNetCore.Authorization;
using static System.Runtime.InteropServices.JavaScript.JSType;
using static webapi.Controllers.ContactosClientesController;
using Azure.Storage.Blobs;

namespace webapi.Controllers
{
    [Route("Clientes")]
    [ApiController]
    public class ClientesController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;
        private readonly BlobServiceClient _blobServiceClient;

        public ClientesController(KattionDataBaseContext context, IConfiguration configuration)
        {
            _context = context;
            string connectionString = configuration.GetConnectionString("AzureBlobStorage");
            _blobServiceClient = new BlobServiceClient(connectionString);
        }


        public class ContactoClienteDto
        {
            public int ContactoId { get; set; }
            public string Nombre { get; set; }
            public string Apellido { get; set; }
            public string Email { get; set; }
            public string Telefono { get; set; }
            public string Cargo { get; set; }
            public IdiomaDTO Idioma { get; set; }
            public TipoContactoDTO TipoContacto { get; set; }
        }

        public class ClienteDto
        {
            public int ClienteId { get; set; }
            public string Nombre { get; set; }
            public string Ciudad { get; set; }
            public string EstadoProvincia { get; set; }
            public string Direccion { get; set; }
            public string Web { get; set; }
            public string Telefono { get; set; }
            public string Email { get; set; }
            public string? Notas { get; set; }
            public string? UsuarioWeb { get; set; }
            public string? ClaveWeb { get; set; }
            public List<ContactoClienteDto> Contactos { get; set; }
            public PaisDTO Pais { get; set; }
            public IdiomaDTO Idioma { get; set; }
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<ClienteDto>> GetCliente(int id)
        {
            if (_context.Clientes == null)
            {
                return NotFound();
            }

            var cliente = await _context.Clientes
                .Include(c => c.CodigoPaisNavigation)
                .Include(c => c.CodigoIdiomaNavigation)
                .Include(c => c.ContactosClientes)
                    .ThenInclude(cc => cc.TipoContactoCliente)
                .Select(c => new ClienteDto
                {
                    ClienteId = c.ClienteId,
                    Nombre = c.Nombre,
                    Ciudad = c.Ciudad,
                    EstadoProvincia = c.EstadoProvincia,
                    Direccion = c.Direccion,
                    Web = c.Web,
                    Telefono = c.Telefono,
                    Email = c.Email,
                    Notas = c.Notas,
                    UsuarioWeb = c.UsuarioWeb,
                    ClaveWeb = c.ClaveWeb,
                    Pais = new PaisDTO
                    {
                        Nombre = c.CodigoPaisNavigation.Nombre,
                        CodigoPais = c.CodigoPaisNavigation.CodigoPais
                    },
                    Idioma = new IdiomaDTO
                    {
                        Nombre = c.CodigoIdiomaNavigation.Nombre,
                        CodigoIdioma = c.CodigoIdiomaNavigation.CodigoIdioma
                    },
                    Contactos = c.ContactosClientes.Select(cc => new ContactoClienteDto
                    {
                        ContactoId = cc.ContactoId,
                        Nombre = cc.Nombre,
                        Apellido = cc.Apellido,
                        Email = cc.Email,
                        Telefono = cc.Telefono,
                        Cargo = cc.Cargo,
                        Idioma = new IdiomaDTO
                        {
                            Nombre = cc.CodigoIdiomaNavigation.Nombre,
                            CodigoIdioma = cc.CodigoIdiomaNavigation.CodigoIdioma
                        },
                        TipoContacto = new TipoContactoDTO
                        {
                            TipoContactoClienteId = cc.TipoContactoClienteId,
                            Nombre = cc.TipoContactoCliente.Nombre
                        }
                    }).ToList()
                })
                .FirstOrDefaultAsync(c => c.ClienteId == id);

            if (cliente == null)
            {
                return NotFound();
            }

            return cliente;
        }


        [HttpGet("Buscar")]
        public async Task<ActionResult<IEnumerable<ClienteDto>>> GetClientesConFiltro(string? DropdownSearch, int? ClienteId, string? Nombre, string? CodigoPais, string? Ciudad, string? EstadoProvincia, string? NombreContacto, int? TipoContacto, bool cantidad)
        {
            var query = _context.Clientes
                .Include(c => c.CodigoPaisNavigation)
                .Include(c => c.CodigoIdiomaNavigation)
                .Include(c => c.ContactosClientes)
                    .ThenInclude(cc => cc.TipoContactoCliente)
                .AsQueryable();

            cantidad = false;
            if (!string.IsNullOrWhiteSpace(DropdownSearch))
            {
                query = query.Where(c => c.Nombre.Contains(DropdownSearch) || c.ClienteId.ToString().Contains(DropdownSearch));
                cantidad = true;
            }

            if (ClienteId.HasValue)
            {
                query = query.Where(c => c.ClienteId.ToString().Contains(ClienteId.Value.ToString()));
            }

            if (!string.IsNullOrWhiteSpace(Nombre))
            {
                query = query.Where(c => c.Nombre.Contains(Nombre));
            }

            if (!string.IsNullOrWhiteSpace(CodigoPais))
            {
                query = query.Where(c => c.CodigoPais == CodigoPais);
            }

            if (!string.IsNullOrWhiteSpace(Ciudad))
            {
                query = query.Where(c => c.Ciudad.Contains(Ciudad));
            }


            if (!string.IsNullOrWhiteSpace(EstadoProvincia))
            {
                query = query.Where(c => c.EstadoProvincia.Contains(EstadoProvincia));
            }

            if (!string.IsNullOrWhiteSpace(NombreContacto))
            {
                query = query.Where(c => c.ContactosClientes.Any(cc => cc.Nombre.Contains(NombreContacto)));
            }

            if (TipoContacto.HasValue)
            {
                query = query.Where(c => c.ContactosClientes.Any(cc => cc.TipoContactoClienteId == TipoContacto.Value));
            }
            var clientes = new List<ClienteDto>();
            if (cantidad)
            {
                clientes = await query
                .Select(c => new ClienteDto
                {
                    ClienteId = c.ClienteId,
                    Nombre = c.Nombre,
                    Ciudad = c.Ciudad,
                    EstadoProvincia = c.EstadoProvincia,
                    Direccion = c.Direccion,
                    Web = c.Web,
                    Telefono = c.Telefono,
                    Email = c.Email,
                    Notas = c.Notas,
                    UsuarioWeb = c.UsuarioWeb,
                    ClaveWeb = c.ClaveWeb,
                    Pais = new PaisDTO
                    {
                        Nombre = c.CodigoPaisNavigation.Nombre,
                        CodigoPais = c.CodigoPaisNavigation.CodigoPais
                    },
                    Idioma = new IdiomaDTO
                    {
                        Nombre = c.CodigoIdiomaNavigation.Nombre,
                        CodigoIdioma = c.CodigoIdiomaNavigation.CodigoIdioma
                    }
                })
                .Take(50)
                .ToListAsync();
            }
            else
            {
                clientes = await query
                .Select(c => new ClienteDto
                {
                    ClienteId = c.ClienteId,
                    Nombre = c.Nombre,
                    Ciudad = c.Ciudad,
                    EstadoProvincia = c.EstadoProvincia,
                    Direccion = c.Direccion,
                    Web = c.Web,
                    Telefono = c.Telefono,
                    Email = c.Email,
                    Notas = c.Notas,
                    UsuarioWeb = c.UsuarioWeb,
                    ClaveWeb = c.ClaveWeb,
                    Pais = new PaisDTO
                    {
                        Nombre = c.CodigoPaisNavigation.Nombre,
                        CodigoPais = c.CodigoPaisNavigation.CodigoPais
                    },
                    Idioma = new IdiomaDTO
                    {
                        Nombre = c.CodigoIdiomaNavigation.Nombre,
                        CodigoIdioma = c.CodigoIdiomaNavigation.CodigoIdioma
                    }
                })
                .ToListAsync();
            }
            return clientes;
        }

        public class MarcaClienteDto
        {
            public int MarcaId { get; set; }
            public string Signo { get; set; }
            public bool? Comparacion { get; set; }
        }


        [HttpGet("{id}/Marcas")]
        public async Task<ActionResult<IEnumerable<MarcaClienteDto>>> GetMarcasPorCliente(int id)
        {
            if (_context.Clientes == null || !_context.Clientes.Any(e => e.ClienteId == id))
            {
                return NotFound("Cliente not found");
            }

            var marcas = await _context.Marcas
                .Where(m => m.ClienteId == id)
                .Select(m => new MarcaClienteDto
                {
                    MarcaId = m.MarcaId,
                    Signo = m.Signo,
                    Comparacion = m.Comparacion
                })
                .ToListAsync();

            return Ok(marcas);
        }

        public class ComparacionMarcasDto
        {
            public bool Comparacion { get; set; }
        }

        [HttpPost("{id}/UpdateMarcasComparacion")]
        public async Task<IActionResult> UpdateMarcasComparacion(int id, [FromBody] ComparacionMarcasDto comparacionUpdateDto)
        {
            var cliente = await _context.Clientes.Include(c => c.MarcaClientes).FirstOrDefaultAsync(c => c.ClienteId == id);
            if (cliente == null)
            {
                return NotFound("Cliente not found");
            }

            foreach (var marca in cliente.MarcaClientes)
            {
                marca.Comparacion = comparacionUpdateDto.Comparacion;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, "Error updating database: " + ex.Message);
            }

            return Ok("Comparacion updated for all marcas of the cliente");
        }




        public class ContactoClienteInputDto
        {
            public int? TipoContactoClienteId { get; set; }
            public string Nombre { get; set; }
            public string Apellido { get; set; }
            public string Email { get; set; }
            public string Telefono { get; set; }
            public string Cargo { get; set; }
            public string CodigoIdioma { get; set; }
        }


        public class ClienteInputDto
        {
            public string Nombre { get; set; }
            public string CodigoPais { get; set; }
            public string Ciudad { get; set; }
            public string EstadoProvincia { get; set; }
            public string CodigoIdioma { get; set; }
            public string Direccion { get; set; }
            public string Web { get; set; }
            public string Telefono { get; set; }
            public string Email { get; set; }
            public string Notas { get; set; }
            public string UsuarioWeb { get; set; }
            public string ClaveWeb { get; set; }
            public List<ContactoClienteInputDto> ContactosClientes { get; set; }
        }


        public class ClienteInputPUTDto
        {
            public string Nombre { get; set; }
            public string CodigoPais { get; set; }
            public string Ciudad { get; set; }
            public string EstadoProvincia { get; set; }
            public string CodigoIdioma { get; set; }
            public string Direccion { get; set; }
            public string Web { get; set; }
            public string Telefono { get; set; }
            public string Email { get; set; }
            public string Notas { get; set; }
            public string UsuarioWeb { get; set; }
            public string ClaveWeb { get; set; }
        }






        [HttpPut("{id}")]
        public async Task<IActionResult> PutCliente(int id, ClienteInputPUTDto ClienteInputPUTDto)
        {
            if (id <= 0)
            {
                return BadRequest("Invalid ID");
            }

            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null)
            {
                return NotFound();
            }

            cliente.Nombre = ClienteInputPUTDto.Nombre;
            cliente.CodigoPais = ClienteInputPUTDto.CodigoPais;
            cliente.Ciudad = ClienteInputPUTDto.Ciudad;
            cliente.EstadoProvincia = ClienteInputPUTDto.EstadoProvincia;
            cliente.CodigoIdioma = ClienteInputPUTDto.CodigoIdioma;
            cliente.Direccion = ClienteInputPUTDto.Direccion;
            cliente.Web = ClienteInputPUTDto.Web;
            cliente.Telefono = ClienteInputPUTDto.Telefono;
            cliente.Email = ClienteInputPUTDto.Email;
            cliente.Notas = ClienteInputPUTDto.Notas;
            cliente.UsuarioWeb = ClienteInputPUTDto.UsuarioWeb;
            cliente.ClaveWeb = ClienteInputPUTDto.ClaveWeb;

            _context.Entry(cliente).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                if (!ClienteExists(id))
                {
                    return NotFound();
                }
                else
                {
                    return StatusCode(500, "Error al guardar los cambios: " + ex.Message);
                }
            }

            return NoContent();
        }


        [HttpPost]
        public async Task<ActionResult<ClienteDto>> PostCliente(ClienteInputDto clienteInputDto)
        {
            var cliente = new Cliente
            {
                Nombre = clienteInputDto.Nombre,
                CodigoPais = clienteInputDto.CodigoPais,
                Ciudad = clienteInputDto.Ciudad,
                EstadoProvincia = clienteInputDto.EstadoProvincia,
                CodigoIdioma = clienteInputDto.CodigoIdioma,
                Direccion = clienteInputDto.Direccion,
                Web = clienteInputDto.Web,
                Telefono = clienteInputDto.Telefono,
                Email = clienteInputDto.Email,
                Notas = clienteInputDto.Notas,
                UsuarioWeb = clienteInputDto.UsuarioWeb,
                ClaveWeb = clienteInputDto.ClaveWeb,
                ContactosClientes = new List<ContactosCliente>()
            };

            foreach (var contactoDto in clienteInputDto.ContactosClientes)
            {
                var contacto = new ContactosCliente
                {
                    TipoContactoClienteId = contactoDto.TipoContactoClienteId,
                    Nombre = contactoDto.Nombre,
                    Apellido = contactoDto.Apellido,
                    Email = contactoDto.Email,
                    Telefono = contactoDto.Telefono,
                    Cargo = contactoDto.Cargo,
                    CodigoIdioma = contactoDto.CodigoIdioma
                };
                cliente.ContactosClientes.Add(contacto);
            }


            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();

            var created_cliente = new ClienteDto
            {
                ClienteId = cliente.ClienteId,
                Nombre = cliente.Nombre,
                Ciudad = cliente.Ciudad,
                EstadoProvincia = cliente.EstadoProvincia,
                Direccion = cliente.Direccion,
                Web = cliente.Web,
                Telefono = cliente.Telefono,
                Email = cliente.Email,
                Notas = cliente.Notas,
                UsuarioWeb = cliente.UsuarioWeb,
                ClaveWeb = cliente.ClaveWeb,
                Contactos = cliente.ContactosClientes.Select(contacto => new ContactoClienteDto
                {
                    ContactoId = contacto.ContactoId,
                    Nombre = contacto.Nombre,
                    Apellido = contacto.Apellido,
                    Email = contacto.Email,
                    Telefono = contacto.Telefono,
                    Cargo = contacto.Cargo
                }).ToList()
            };



            return CreatedAtAction("GetCliente", new { id = cliente.ClienteId }, created_cliente);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCliente(int id)
        {
            if (_context.Clientes == null)
            {
                return NotFound();
            }

            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null)
            {
                return NotFound();
            }

            await DeleteCarpetaCliente(id);

            _context.Clientes.Remove(cliente);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task DeleteCarpetaCliente(int clienteId)
        {
            string nombreContenedor = "cliente";
            string nombreCarpeta = $"cliente{clienteId}/";

            var containerClient = _blobServiceClient.GetBlobContainerClient(nombreContenedor);
            if (await containerClient.ExistsAsync())
            {
                await foreach (var blobItem in containerClient.GetBlobsAsync(prefix: nombreCarpeta))
                {
                    var blobClient = containerClient.GetBlobClient(blobItem.Name);
                    await blobClient.DeleteIfExistsAsync();
                }
            }

            var documentos = await _context.ConexionDocumentos
                .Where(d => d.IdConexion == clienteId && d.TablaConexion == "cliente")
                .ToListAsync();

            _context.ConexionDocumentos.RemoveRange(documentos);
        }


        private bool ClienteExists(int id)
        {
            return (_context.Clientes?.Any(e => e.ClienteId == id)).GetValueOrDefault();
        }
    }
}
