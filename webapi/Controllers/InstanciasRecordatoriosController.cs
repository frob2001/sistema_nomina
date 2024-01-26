using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using static webapi.Controllers.RecordatoriosController;

namespace webapi.Controllers
{
    [Route("InstanciasRecordatorios")]
    [ApiController]
    public class InstanciasRecordatoriosController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;

        public InstanciasRecordatoriosController(KattionDataBaseContext context)
        {
            _context = context;
        }


        public class InstanciasRecordatorioDTO
        {
            public int InstanciasRecordatorioId { get; set; }
            public int? RecordatorioId { get; set; }
            public DateTime? Fecha { get; set; }
            public bool? Activo { get; set; }
            public InstanciaConRecordatorioDTO? Recordatorio { get; set; }
        }

        public class InstanciaConRecordatorioDTO
        {
            public int RecordatorioId { get; set; }
            public string Descripcion { get; set; } = null!;
            public string? TablaConexion { get; set; }
            public int? IdConexion { get; set; }
        }

        public class InstanciasRecordatorioInputDTO
        {
            public int? RecordatorioId { get; set; }
            public DateTime? Fecha { get; set; }
            public bool? Activo { get; set; }
        }

        // GET: api/InstanciasRecordatorios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InstanciasRecordatorioDTO>>> GetInstanciasRecordatorios()
        {
            if (_context.InstanciasRecordatorios == null)
            {
                return NotFound();
            }

            var instanciasConRecordatorio = await _context.InstanciasRecordatorios
                .Include(ir => ir.Recordatorio) // Asegúrate de que 'Recordatorio' sea el nombre correcto de la propiedad de navegación
                .Select(ir => new InstanciasRecordatorioDTO
                {
                    InstanciasRecordatorioId = ir.InstanciasRecordatorioId,
                    RecordatorioId = ir.RecordatorioId,
                    Fecha = ir.Fecha,
                    Activo = ir.Activo,
                    Recordatorio = ir.Recordatorio == null ? null : new InstanciaConRecordatorioDTO
                    {
                        
                        RecordatorioId = ir.Recordatorio.RecordatorioId,
                        Descripcion = ir.Recordatorio.Descripcion,
                        TablaConexion = ir.Recordatorio.TablaConexion,
                        IdConexion = ir.Recordatorio.IdConexion,
                    }
                }).ToListAsync();

            return instanciasConRecordatorio;
        }


        // GET: api/InstanciasRecordatorios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<InstanciasRecordatorioDTO>> GetInstanciasRecordatorio(int id)
        {
            if (_context.InstanciasRecordatorios == null)
            {
                return NotFound();
            }

            var instanciasRecordatorio = await _context.InstanciasRecordatorios
                .Include(ir => ir.Recordatorio) // Asegúrate de que 'Recordatorio' sea el nombre correcto de la propiedad de navegación
                .Where(ir => ir.InstanciasRecordatorioId == id)
                .Select(ir => new InstanciasRecordatorioDTO
                {
                    InstanciasRecordatorioId = ir.InstanciasRecordatorioId,
                    RecordatorioId = ir.RecordatorioId,
                    Fecha = ir.Fecha,
                    Activo = ir.Activo,
                    Recordatorio = ir.Recordatorio == null ? null : new InstanciaConRecordatorioDTO
                    {
                        RecordatorioId = ir.Recordatorio.RecordatorioId,
                        Descripcion = ir.Recordatorio.Descripcion,
                        TablaConexion = ir.Recordatorio.TablaConexion,
                        IdConexion = ir.Recordatorio.IdConexion,
                    }
                }).FirstOrDefaultAsync();

            if (instanciasRecordatorio == null)
            {
                return NotFound();
            }

            return instanciasRecordatorio;
        }

        // GET: api/InstanciasRecordatorios/Buscar
        [HttpGet("Buscar")]
        public async Task<ActionResult<IEnumerable<InstanciasRecordatorioDTO>>> GetInstanciasRecordatorioPorConexion(string tablaConexion, int idConexion)
        {
            if (_context.InstanciasRecordatorios == null)
            {
                return NotFound();
            }

            var instanciasConRecordatorio = await _context.InstanciasRecordatorios
                .Include(ir => ir.Recordatorio)
                .Where(ir => ir.Recordatorio.TablaConexion == tablaConexion && ir.Recordatorio.IdConexion == idConexion)
                .Select(ir => new InstanciasRecordatorioDTO
                {
                    InstanciasRecordatorioId = ir.InstanciasRecordatorioId,
                    RecordatorioId = ir.RecordatorioId,
                    Fecha = ir.Fecha,
                    Activo = ir.Activo,
                    Recordatorio = ir.Recordatorio == null ? null : new InstanciaConRecordatorioDTO
                    {
                        RecordatorioId = ir.Recordatorio.RecordatorioId,
                        Descripcion = ir.Recordatorio.Descripcion,
                        TablaConexion = ir.Recordatorio.TablaConexion,
                        IdConexion = ir.Recordatorio.IdConexion,
                    }
                }).ToListAsync();

            return instanciasConRecordatorio;
        }

        // GET: api/InstanciasRecordatorios/Usuario/5
        [HttpGet("Usuario/{usuarioId}")]
        public async Task<ActionResult<IEnumerable<InstanciasRecordatorioDTO>>> GetInstanciasRecordatorioPorUsuario(int usuarioId)
        {
            // Verificar si el usuario existe
            var usuario = await _context.Usuarios.FindAsync(usuarioId);
            if (usuario == null)
            {
                return NotFound("No se encontró el usuario especificado.");
            }

            var instanciasDeUsuario = await _context.InstanciasRecordatorios
                .Include(ir => ir.Recordatorio)
                    .ThenInclude(r => r.IdUsuarios)
                .Where(ir => ir.Recordatorio.IdUsuarios.Any(u => u.IdUsuario == usuarioId))
                .Select(ir => new InstanciasRecordatorioDTO
                {
                    InstanciasRecordatorioId = ir.InstanciasRecordatorioId,
                    RecordatorioId = ir.RecordatorioId,
                    Fecha = ir.Fecha,
                    Activo = ir.Activo,
                    Recordatorio = ir.Recordatorio == null ? null : new InstanciaConRecordatorioDTO
                    {
                        RecordatorioId = ir.Recordatorio.RecordatorioId,
                        Descripcion = ir.Recordatorio.Descripcion,
                        TablaConexion = ir.Recordatorio.TablaConexion,
                        IdConexion = ir.Recordatorio.IdConexion,
                    }
                }).ToListAsync();

            if (!instanciasDeUsuario.Any())
            {
                return Ok(new { message = "No hay recordatorios para este usuario." });
            }

            return Ok(instanciasDeUsuario);
        }





        // PUT: api/InstanciasRecordatorios/5/activo
        [HttpPut("{id}/activo")]
        public async Task<IActionResult> PutInstanciasRecordatorio(int id, [FromBody] bool activo)
        {
            var instanciasRecordatorio = await _context.InstanciasRecordatorios.FindAsync(id);
            if (instanciasRecordatorio == null)
            {
                return NotFound();
            }

            instanciasRecordatorio.Activo = activo;

            _context.Entry(instanciasRecordatorio).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InstanciasRecordatorioExists(id))
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
        public async Task<ActionResult<InstanciasRecordatorio>> PostInstanciasRecordatorio(InstanciasRecordatorioInputDTO InstanciasRecordatorioInputDTO)
        {
            if (_context.InstanciasRecordatorios == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.InstanciasRecordatorios'  is null.");
            }

            var instanciasRecordatorio = new InstanciasRecordatorio
            {
                RecordatorioId = InstanciasRecordatorioInputDTO.RecordatorioId,
                Fecha = InstanciasRecordatorioInputDTO.Fecha,
                Activo = InstanciasRecordatorioInputDTO.Activo.HasValue ? InstanciasRecordatorioInputDTO.Activo.Value : false
            };

            _context.InstanciasRecordatorios.Add(instanciasRecordatorio);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetInstanciasRecordatorio", new { id = instanciasRecordatorio.InstanciasRecordatorioId }, instanciasRecordatorio);
        }

        // DELETE: api/InstanciasRecordatorios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInstanciasRecordatorio(int id)
        {
            if (_context.InstanciasRecordatorios == null)
            {
                return NotFound();
            }
            var instanciasRecordatorio = await _context.InstanciasRecordatorios.FindAsync(id);
            if (instanciasRecordatorio == null)
            {
                return NotFound();
            }

            _context.InstanciasRecordatorios.Remove(instanciasRecordatorio);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool InstanciasRecordatorioExists(int id)
        {
            return (_context.InstanciasRecordatorios?.Any(e => e.InstanciasRecordatorioId == id)).GetValueOrDefault();
        }
    }
}
