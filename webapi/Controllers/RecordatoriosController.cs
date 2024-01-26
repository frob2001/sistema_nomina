using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;

namespace webapi.Controllers
{
    [Route("Recordatorios")]
    [ApiController]
    public class RecordatoriosController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public RecordatoriosController(KattionDataBaseContext context)
        {
            _context = context;
        }
        public class InstanciaRecordatorioDTO
        {
            public int? InstanciasRecordatorioId { get; set; }
            public DateTime? Fecha { get; set; }
            public bool? Activo { get; set; }
        }

        public class UsuarioRecordatorioDTO
        {
            public int IdUsuario { get; set; }
            public string Correo { get; set; } = null!;
            public string Nombre { get; set; } = null!;
            public string Apellido { get; set; }

        }

        public class RecordatorioDTO
        {
            public int RecordatorioId { get; set; }
            public string Descripcion { get; set; } = null!;
            public string? TablaConexion { get; set; }
            public int? IdConexion { get; set; }
            public List<InstanciaRecordatorioDTO>? Instancias { get; set; }
            public List<UsuarioRecordatorioDTO>? Usuarios { get; set; }
        }

        // GET: api/Recordatorios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecordatorioDTO>>> GetRecordatorios()
        {
            if (_context.Recordatorios == null)
            {
                return NotFound();
            }
            return await _context.Recordatorios
                .Include(r => r.InstanciasRecordatorios)
                .Include(r => r.IdUsuarios)
                .Select(r => new RecordatorioDTO
                {
                    RecordatorioId = r.RecordatorioId,
                    Descripcion = r.Descripcion,
                    TablaConexion = r.TablaConexion,
                    IdConexion = r.IdConexion,
                    Instancias = r.InstanciasRecordatorios.Select(ri => new InstanciaRecordatorioDTO
                    {
                        InstanciasRecordatorioId = ri.InstanciasRecordatorioId,
                        Fecha = ri.Fecha,
                        Activo = ri.Activo

                    }).ToList(),
                    Usuarios = r.IdUsuarios.Select(ru => new UsuarioRecordatorioDTO
                    {
                        IdUsuario = ru.IdUsuario,
                        Correo = ru.Correo
                    }).ToList()
                })
                .ToListAsync();
        }

        // GET: api/Recordatorios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RecordatorioDTO>> GetRecordatorio(int id)
        {
            if (_context.Recordatorios == null)
            {
                return NotFound();
            }

            var recordatorio = await _context.Recordatorios
                .Include(r => r.InstanciasRecordatorios)
                .Include(r => r.IdUsuarios)
                .SingleOrDefaultAsync(r => r.RecordatorioId == id);

            if (recordatorio == null)
            {
                return NotFound();
            }

            var recordatorioDTO = new RecordatorioDTO
            {
                RecordatorioId = recordatorio.RecordatorioId,
                Descripcion = recordatorio.Descripcion,
                TablaConexion = recordatorio.TablaConexion,
                IdConexion = recordatorio.IdConexion,
                Instancias = recordatorio.InstanciasRecordatorios.Select(ri => new InstanciaRecordatorioDTO
                {
                    InstanciasRecordatorioId = ri.InstanciasRecordatorioId,
                    Fecha = ri.Fecha,
                    Activo = ri.Activo
                }).ToList(),
                Usuarios = recordatorio.IdUsuarios.Select(ru => new UsuarioRecordatorioDTO
                {
                    IdUsuario = ru.IdUsuario,
                    Correo = ru.Correo,
                    Nombre = ru.Nombre,
                    Apellido = ru.Apellido
                }).ToList()
            };

            return recordatorioDTO;
        }

        // GET: api/Recordatorios/Usuario/5
        [HttpGet("Usuario/{usuarioId}")]
        public async Task<ActionResult<IEnumerable<RecordatorioDTO>>> GetRecordatoriosPorUsuario(int usuarioId)
        {
            if (_context.Recordatorios == null)
            {
                return NotFound();
            }

            var recordatorios = await _context.Recordatorios
                .Where(r => r.IdUsuarios.Any(u => u.IdUsuario == usuarioId))
                .Include(r => r.InstanciasRecordatorios)
                .Include(r => r.IdUsuarios)
                .Select(r => new RecordatorioDTO
                {
                    RecordatorioId = r.RecordatorioId,
                    Descripcion = r.Descripcion,
                    TablaConexion = r.TablaConexion,
                    IdConexion = r.IdConexion,
                    Instancias = r.InstanciasRecordatorios.Select(ri => new InstanciaRecordatorioDTO
                    {
                        InstanciasRecordatorioId = ri.InstanciasRecordatorioId,
                        Fecha = ri.Fecha,
                        Activo = ri.Activo
                    }).ToList(),
                    Usuarios = r.IdUsuarios.Select(ru => new UsuarioRecordatorioDTO
                    {
                        IdUsuario = ru.IdUsuario,
                        Correo = ru.Correo,
                        Nombre = ru.Nombre,
                        Apellido = ru.Apellido
                    }).ToList()
                })
                .ToListAsync();

            return recordatorios;
        }

        // GET: api/Recordatorios/BuscarPorConexion
        [HttpGet("Buscar")]
        public async Task<ActionResult<IEnumerable<RecordatorioDTO>>> GetRecordatoriosPorConexion(string tablaConexion, int conexionId)
        {
            if (_context.Recordatorios == null)
            {
                return NotFound();
            }

            var recordatorios = await _context.Recordatorios
                .Where(r => r.TablaConexion == tablaConexion && r.IdConexion == conexionId)
                .Include(r => r.InstanciasRecordatorios)
                .Include(r => r.IdUsuarios)
                .Select(r => new RecordatorioDTO
                {
                    RecordatorioId = r.RecordatorioId,
                    Descripcion = r.Descripcion,
                    TablaConexion = r.TablaConexion,
                    IdConexion = r.IdConexion,
                    Instancias = r.InstanciasRecordatorios.Select(ri => new InstanciaRecordatorioDTO
                    {
                        InstanciasRecordatorioId = ri.InstanciasRecordatorioId,
                        Fecha = ri.Fecha,
                        Activo = ri.Activo
                    }).ToList(),
                    Usuarios = r.IdUsuarios.Select(ru => new UsuarioRecordatorioDTO
                    {
                        IdUsuario = ru.IdUsuario,
                        Correo = ru.Correo,
                        Nombre = ru.Nombre,
                        Apellido = ru.Apellido
                    }).ToList()
                })
                .ToListAsync();

            if (!recordatorios.Any())
            {
                return NotFound("No se encontraron recordatorios con los criterios especificados.");
            }

            return recordatorios;
        }


        public class RecordatorioCreateDTO
        {
            public string Descripcion { get; set; } = null!;
            public string? TablaConexion { get; set; }
            public int? IdConexion { get; set; }
            public List<InstanciaRecordatorioDTO> Instancias { get; set; }
            public List<int> IdUsuarios { get; set; }
        }

        // POST: api/Recordatorios/Multiple
        [HttpPost]
        public async Task<ActionResult<RecordatorioDTO>> PostMultipleRecordatorios([FromBody] RecordatorioCreateDTO recordatorioCreateDTO)
        {
            if (_context.Recordatorios == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.Recordatorios' is null.");
            }

            var recordatorio = new Recordatorio
            {
                Descripcion = recordatorioCreateDTO.Descripcion,
                TablaConexion = recordatorioCreateDTO.TablaConexion,
                IdConexion = recordatorioCreateDTO.IdConexion,
                InstanciasRecordatorios = recordatorioCreateDTO.Instancias.Select(i => new InstanciasRecordatorio
                {
                    Fecha = i.Fecha,
                    Activo = i.Activo
                }).ToList(),
                IdUsuarios = _context.Usuarios.Where(u => recordatorioCreateDTO.IdUsuarios.Contains(u.IdUsuario)).ToList()
            };

            _context.Recordatorios.Add(recordatorio);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRecordatorio", new { id = recordatorio.RecordatorioId }, new RecordatorioDTO
            {
                RecordatorioId = recordatorio.RecordatorioId,
                Descripcion = recordatorio.Descripcion,
                TablaConexion = recordatorio.TablaConexion,
                IdConexion = recordatorio.IdConexion,
                Instancias = recordatorio.InstanciasRecordatorios.Select(ri => new InstanciaRecordatorioDTO
                {
                    InstanciasRecordatorioId = ri.InstanciasRecordatorioId,
                    Fecha = ri.Fecha,
                    Activo = ri.Activo
                }).ToList(),
                Usuarios = recordatorio.IdUsuarios.Select(u => new UsuarioRecordatorioDTO
                {
                    IdUsuario = u.IdUsuario,
                    Correo = u.Correo
                }).ToList()
            });
        }

        public class RecordatorioUpdateDTO
        {
            public string Descripcion { get; set; }
            public List<InstanciaRecordatorioDTO> Instancias { get; set; } // Agregamos esta línea
            public List<int> IdUsuarios { get; set; }
        }


        // PUT: api/Recordatorios/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRecordatorio(int id, RecordatorioUpdateDTO recordatorioUpdateDTO)
        {
            if (_context.Recordatorios == null)
            {
                return NotFound();
            }

            var recordatorio = await _context.Recordatorios
                .Include(r => r.InstanciasRecordatorios)
                .Include(r => r.IdUsuarios)
                .FirstOrDefaultAsync(r => r.RecordatorioId == id);

            if (recordatorio == null)
            {
                return NotFound();
            }

            _context.InstanciasRecordatorios.RemoveRange(recordatorio.InstanciasRecordatorios);

            // Crear y asignar nuevas instancias
            recordatorio.InstanciasRecordatorios = recordatorioUpdateDTO.Instancias.Select(i => new InstanciasRecordatorio
            {
                Fecha = i.Fecha,
                Activo = i.Activo
            }).ToList();

            // Actualizar descripción y otros campos si es necesario
            recordatorio.Descripcion = recordatorioUpdateDTO.Descripcion;

            // Actualizar usuarios asociados
            recordatorio.IdUsuarios = await _context.Usuarios
                .Where(u => recordatorioUpdateDTO.IdUsuarios.Contains(u.IdUsuario))
                .ToListAsync();

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RecordatorioExists(id))
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



        // DELETE: api/Recordatorios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecordatorio(int id)
        {
            var recordatorio = await _context.Recordatorios
                .Include(r => r.InstanciasRecordatorios)
                .FirstOrDefaultAsync(r => r.RecordatorioId == id);

            if (recordatorio == null)
            {
                return NotFound();
            }

            // Eliminar instancias de recordatorio
            _context.InstanciasRecordatorios.RemoveRange(recordatorio.InstanciasRecordatorios);

            // Eliminar el recordatorio
            _context.Recordatorios.Remove(recordatorio);

            await _context.SaveChangesAsync();

            return NoContent();
        }


        private bool RecordatorioExists(int id)
        {
            return (_context.Recordatorios?.Any(e => e.RecordatorioId == id)).GetValueOrDefault();
        }
    }
}
