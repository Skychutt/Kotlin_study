# Kotlin 从零到 Android 独立开发全教程

> 目标：系统掌握 Kotlin 语法、语言思想和 Android 现代开发栈，最终能独立分析需求、设计架构、完成应用、测试并发布。本文以 Kotlin/JVM 与 Jetpack Compose 为主，也说明传统 View/XML 的衔接点。

## 使用方法与学习路线

不要只读。每节的示例都应亲手输入并修改，完成练习后再进入下一阶段。

1. **语言基础（第 1～8 章）**：能写命令行程序，理解空安全、函数、类、集合和异常。
2. **进阶语法（第 9～15 章）**：掌握泛型、扩展、高阶函数、委托、DSL、协程与 Flow。
3. **Android 基础（第 16～24 章）**：掌握 Compose、状态、导航、架构、网络、存储、测试和发布。
4. **第一毕业项目（第 25 章）**：独立完成“离线优先任务管理 App”。
5. **生产级 Android（第 26～50 章）**：掌握平台能力、Navigation 3、自适应 UI、媒体、登录、推送、支付、同步、安全、性能、CI/CD 和 Play 上架运营。

建议周期：每天 1～2 小时，18～24 周。每学完一章，完成末尾练习并提交一次 Git 记录。

---

## 第 1 章：环境、程序结构与第一段 Kotlin

Android 开发安装 Android Studio（内含 JDK），新建项目时选择 Kotlin。练习纯语法可使用 IntelliJ IDEA、Android Studio 的 Scratch File，或 Kotlin Playground。

Kotlin 源文件以 `.kt` 结尾。程序从顶层 `main` 函数开始：

```kotlin
package com.example.learn

import kotlin.math.PI

fun main() {
    val radius = 3.0
    println("面积 = ${PI * radius * radius}")
}
```

- `package` 声明命名空间，通常与目录结构一致。
- `import` 导入名称；可用 `as` 起别名：`import java.util.Date as JavaDate`。
- 分号通常省略，注释有 `//`、`/* */` 和用于文档的 `/** */`。
- Kotlin 区分大小写，推荐类名用 `UpperCamelCase`，函数和变量用 `lowerCamelCase`，常量用 `UPPER_SNAKE_CASE`。

### 编译模型

Kotlin/JVM 编译成 JVM 字节码，与 Java 双向调用；Android 再把字节码转换为设备使用的格式。Kotlin 还可面向 JavaScript、Native 和 Multiplatform，但 Android 初学阶段先专注 JVM。

**练习**：输出姓名、学习目标和未来 30 天的学习时长；再定义一个计算圆周长的函数。

---

## 第 2 章：变量、常量、类型与运算符

### val 与 var

```kotlin
val language: String = "Kotlin" // 只读引用，优先使用
var level = 1                   // 可重新赋值，类型推断为 Int
level += 1

const val API_VERSION = "v1"   // 编译期常量，只能在顶层、object 或 companion object
```

`val` 表示引用不能更换，不代表对象内部不可变。尽量使用不可变数据，状态变化会更容易推理。

### 基本类型

整数：`Byte`、`Short`、`Int`、`Long`；浮点：`Float`、`Double`；另有 `Boolean`、`Char`、`String`。Kotlin 不做隐式数值扩大转换：

```kotlin
val count: Int = 42
val total: Long = count.toLong()
val hex = 0xFF
val binary = 0b1010
val readable = 1_000_000
val ratio = 3.14f
```

字符串可用模板和多行原始字符串：

```kotlin
val user = "Lin"
val message = "Hello, $user，明年你 ${20 + 1} 岁"
val json = """
    {
      "name": "$user"
    }
""".trimIndent()
```

### 运算符

- 算术：`+ - * / %`。整数相除仍为整数；需要小数先转 `Double`。
- 比较：`== != < <= > >=`；`==` 比内容，`===` 比引用身份。
- 逻辑：`&& || !`，支持短路。
- 区间：`1..10`、`1..<10`、`10 downTo 1`、`1..10 step 2`。
- 成员判断：`in`、`!in`；类型判断：`is`、`!is`。
- 位运算是命名函数：`shl`、`shr`、`ushr`、`and`、`or`、`xor`、`inv()`。

```kotlin
val score = 86
val passed = score in 60..100
val label = if (passed) "通过" else "重修"
```

Kotlin 可重载约定运算符，例如 `a + b` 对应 `a.plus(b)`，但应保持直觉语义。

**练习**：编写温度转换、BMI 计算器，并正确处理整数除法。

---

## 第 3 章：空安全与类型转换

空指针是 Android 崩溃的常见来源。Kotlin 把“可为空”编码进类型：`String` 不能为 null，`String?` 可以。

```kotlin
var nickname: String? = null
val length: Int? = nickname?.length             // 安全调用
val display = nickname ?: "未设置"               // Elvis 运算符
nickname?.let { println(it.uppercase()) }        // 非空才执行
```

常见工具：

- `?.`：安全访问；链中任何一环为 null，整体返回 null。
- `?:`：左侧为 null 时使用右侧；右侧也可 `return` 或 `throw`。
- `!!`：断言非空，错误会抛 NPE；业务代码应极少使用。
- `as?`：安全类型转换，失败返回 null；`as` 失败抛异常。

```kotlin
fun requireName(input: String?): String {
    return input?.trim()?.takeIf { it.isNotEmpty() }
        ?: throw IllegalArgumentException("姓名不能为空")
}

fun printLength(value: Any?) {
    if (value is String) {
        println(value.length) // 智能转换为 String
    }
}
```

### 平台类型

Java 代码返回的值可能显示为 `String!`，编译器无法判断其可空性。调用 Java/旧 Android API 时主动检查 null，不要盲用 `!!`。

**练习**：实现 `parseAge(text: String?): Int?`，只接受 0～150；分别用安全调用、`toIntOrNull` 和 Elvis 完成。

---

## 第 4 章：流程控制

Kotlin 的 `if`、`when`、`try` 都是表达式，可以直接产生值。

```kotlin
val max = if (a > b) a else b

val description = when (score) {
    100 -> "满分"
    in 90..99 -> "优秀"
    in 60..89 -> "合格"
    else -> "继续努力"
}

fun describe(x: Any) = when (x) {
    is Int -> "整数 $x"
    is String -> "长度 ${x.length} 的文本"
    null -> "空值"
    else -> "其他"
}
```

循环：

```kotlin
for (i in 0 until 5) println(i)
for ((index, value) in names.withIndex()) println("$index: $value")

var attempts = 3
while (attempts > 0) attempts--

outer@ for (row in 0..2) {
    for (col in 0..2) {
        if (row == col) continue@outer
    }
}
```

`break` 结束循环，`continue` 跳过本轮；标签可明确作用于哪一层循环或 lambda。优先用集合操作替代复杂循环，但不要为了“函数式”牺牲可读性。

**练习**：输出九九乘法表；使用 `when` 完成可扩展的命令解析器。

---

## 第 5 章：函数

```kotlin
fun greet(name: String, prefix: String = "你好"): String = "$prefix，$name"

fun main() {
    println(greet(name = "小林"))       // 命名参数
    println(greet("小林", "欢迎"))
}
```

### 参数规则

- 参数必须声明类型，默认是只读的。
- 支持默认参数和命名参数；调用 Java 方法时通常不能使用命名参数。
- `Unit` 类似“无有意义返回值”，可省略。
- `Nothing` 表示永不正常返回，如只会抛异常的函数。
- 顶层函数不必放在工具类中。

### 可变参数与中缀函数

```kotlin
fun sumAll(vararg numbers: Int) = numbers.sum()
val values = intArrayOf(1, 2, 3)
val total = sumAll(0, *values) // 展开数组

infix fun Int.percentOf(total: Int) = this * total / 100
val discount = 20 percentOf 500
```

### 局部函数、尾递归与重载

函数可以嵌套；`tailrec` 可优化满足条件的尾递归。可以同名重载，但仅返回类型不同不能构成重载。Android 中递归通常不如循环稳妥。

```kotlin
tailrec fun factorial(n: Long, acc: Long = 1): Long =
    if (n <= 1) acc else factorial(n - 1, acc * n)
```

**练习**：写一个支持默认税率、命名参数的订单总价函数；再实现最大公约数。

---

## 第 6 章：类、对象与构造

```kotlin
class User(
    val id: Long,
    name: String,
    var age: Int = 0
) {
    var name: String = name.trim()
        set(value) {
            require(value.isNotBlank())
            field = value.trim()
        }

    val isAdult: Boolean
        get() = age >= 18

    init {
        require(id > 0) { "id 必须为正数" }
    }

    constructor(id: Long, name: String) : this(id, name, 0)

    fun birthday() { age++ }
}
```

- 主构造器写在类名后，初始化逻辑放 `init`。
- `field` 是自定义访问器里的幕后字段。
- 没有 `new`，直接 `User(1, "Lin")`。
- Kotlin 类和成员默认 `final`；允许继承需显式 `open`，重写用 `override`。
- 可见性：`public`（默认）、`internal`（模块内）、`protected`、`private`。

### 继承与抽象

```kotlin
abstract class Animal(val name: String) {
    abstract fun sound(): String
    open fun introduce() = "$name: ${sound()}"
}

class Cat(name: String) : Animal(name) {
    override fun sound() = "喵"
}
```

优先组合而非深层继承。Android 状态对象通常用数据类，行为由 ViewModel/用例组织。

**练习**：设计 `BankAccount`，余额只能通过 `deposit` 和 `withdraw` 修改，并验证非法金额。

---

## 第 7 章：接口、数据类、枚举、密封类型与 object

### 接口

```kotlin
interface Repository<T> {
    suspend fun get(id: Long): T?
    fun isValidId(id: Long) = id > 0
}
```

接口可有默认实现但没有构造器。类可实现多个接口，冲突时用 `super<接口名>.方法()` 指定。

### 数据类与解构

```kotlin
data class Task(val id: Long, val title: String, val done: Boolean = false)

val task = Task(1, "学习 Kotlin")
val updated = task.copy(done = true)
val (id, title, done) = updated
```

数据类自动生成 `equals/hashCode/toString/componentN/copy`。主构造器至少有一个 `val/var` 参数。数组属性比较是引用语义，必要时使用内容比较函数。

### enum 与 sealed

```kotlin
enum class Priority(val weight: Int) { LOW(1), MEDIUM(2), HIGH(3) }

sealed interface UiState<out T> {
    data object Loading : UiState<Nothing>
    data class Success<T>(val data: T) : UiState<T>
    data class Error(val message: String) : UiState<Nothing>
}

fun render(state: UiState<List<Task>>) = when (state) {
    UiState.Loading -> "加载中"
    is UiState.Success -> "${state.data.size} 条"
    is UiState.Error -> state.message
}
```

`sealed` 限定可能的子类型，让 `when` 能穷尽检查，非常适合 UI 状态和事件。`enum` 适合固定同构常量。

### object 与伴生对象

```kotlin
object AppLogger { fun log(message: String) = println(message) }

class Token private constructor(val value: String) {
    companion object {
        fun parse(raw: String): Token? = raw.takeIf(String::isNotBlank)?.let(::Token)
    }
}
```

`object` 是线程安全惰性初始化的单例声明；对象表达式 `object : Listener { ... }` 用于匿名实现。避免把可变全局状态塞入单例。

**练习**：用密封接口建模登录的 Idle、Loading、Success、Error 四种状态。

---

## 第 8 章：数组、集合与序列

```kotlin
val readOnly = listOf("A", "B")
val mutable = mutableListOf("A")
mutable += "B"

val ids = setOf(1, 2, 2)                 // 去重
val users = mapOf(1L to "Lin", 2L to "Yu")
val ints = intArrayOf(1, 2, 3)           // 原生类型数组
```

只读接口不等于绝对不可变；不要把底层可变集合泄漏出去。常见操作：

```kotlin
val result = tasks
    .filterNot { it.done }
    .sortedByDescending { it.id }
    .map { it.title }

val byDone = tasks.groupBy(Task::done)
val idMap = tasks.associateBy(Task::id)
val first = tasks.firstOrNull { it.id == 1L }
val total = tasks.fold(0) { acc, _ -> acc + 1 }
```

`map` 保持一一映射，`flatMap` 展平多层；`any/all/none/count` 做条件统计；`zip` 合并相同位置；`chunked/windowed` 分块或滑窗。

大量链式操作可用 `Sequence` 延迟执行，减少中间集合：

```kotlin
val names = (1..1_000_000).asSequence()
    .filter { it % 2 == 0 }
    .map { "No.$it" }
    .take(5)
    .toList()
```

小集合不必滥用 Sequence；它有额外调用开销。

**练习**：对任务列表按完成状态分组，统计每组数量，并找出标题最长的未完成任务。

---

## 第 9 章：Lambda、高阶函数与函数类型

```kotlin
val square: (Int) -> Int = { value -> value * value }

fun calculate(a: Int, b: Int, operation: (Int, Int) -> Int): Int =
    operation(a, b)

val answer = calculate(3, 4) { x, y -> x + y }
```

最后一个参数是函数时可使用尾随 lambda；只有一个参数时可用 `it`。函数引用：`::println`、`String::length`、`user::birthday`。

### 闭包与返回

Lambda 能捕获外部变量。`forEach` 是内联函数，裸 `return` 可能从外层函数返回；用 `return@forEach` 仅跳过本次。复杂控制流更适合普通 `for`。

### inline、noinline、crossinline

```kotlin
inline fun <T> measure(block: () -> T): T {
    val start = System.nanoTime()
    return block().also { println(System.nanoTime() - start) }
}
```

`inline` 把函数体和 lambda 展开到调用处，可减少函数对象并支持非局部返回；`noinline` 禁止某个参数内联，`crossinline` 禁止非局部返回。只给短小高阶函数使用。

**练习**：实现 `retry(times, block)`；失败时重试，最终仍失败则抛出最后一次异常。

---

## 第 10 章：作用域函数与扩展

五个作用域函数本质都是高阶函数：

| 函数 | 对象引用 | 返回值 | 典型用途 |
|---|---|---|---|
| `let` | `it` | lambda 结果 | 空安全转换 |
| `run` | `this` | lambda 结果 | 配置并计算 |
| `with` | `this` | lambda 结果 | 对现有对象执行多步 |
| `apply` | `this` | 对象本身 | 构建/配置对象 |
| `also` | `it` | 对象本身 | 日志、校验等旁路动作 |

```kotlin
val intent = Intent(context, DetailActivity::class.java).apply {
    putExtra("task_id", task.id)
}

val normalized = input?.trim()?.takeIf { it.isNotEmpty() }
```

不要连续嵌套多个作用域函数，`this/it` 会难以辨认。

### 扩展函数与属性

```kotlin
fun String.toSafeInt(default: Int = 0) = trim().toIntOrNull() ?: default
val String.initial: Char? get() = firstOrNull()
```

扩展是静态分发，不会真正修改类，也不能访问其私有成员。成员函数与扩展同名时成员优先。扩展适合无状态、语义内聚的工具；不要制造难以追踪的“万能扩展”。

**练习**：为 `Long` 编写毫秒转 `mm:ss` 的扩展属性，并测试边界。

---

## 第 11 章：泛型、型变与类型系统进阶

```kotlin
class Box<T>(val value: T)

fun <T : Comparable<T>> maxOfTwo(a: T, b: T): T = if (a >= b) a else b

fun <T> requireBoth(value: T) where T : CharSequence, T : Comparable<T> = value
```

JVM 泛型通常发生类型擦除。Kotlin 用声明处型变表达安全关系：生产者 `out`，消费者 `in`。

```kotlin
interface Source<out T> { fun next(): T }
interface Sink<in T> { fun accept(value: T) }
```

- `List<Dog>` 可当作 `List<Animal>`，因为只读列表是 `List<out T>`。
- 可变列表既读又写，不能安全协变。
- 使用处投影：`Array<out Number>`、`Comparable<in String>`。
- 星投影 `List<*>` 表示元素类型未知，读取为 `Any?`。

### reified

```kotlin
inline fun <reified T> Any?.isType(): Boolean = this is T
```

普通泛型不能直接 `is T`；内联的 `reified` 类型参数会保留调用点类型。常用于 JSON 解析、导航和依赖获取。

### typealias 与值类

```kotlin
typealias TaskId = Long

@JvmInline
value class Email(val value: String)
```

`typealias` 只是别名，没有类型安全隔离；值类可创建轻量强类型，但要注意装箱、Java 互操作与序列化配置。

**练习**：设计泛型 `Result<T>`；写 `map` 函数把成功值转换、错误原样传递。

---

## 第 12 章：委托、运算符、解构与 DSL

### 属性委托

```kotlin
val config by lazy { loadConfig() }
var name by Delegates.observable("") { _, old, new ->
    println("$old -> $new")
}
```

自定义委托实现 `getValue`/`setValue`。Android 中 Compose 的 `by remember { mutableStateOf(...) }` 就依赖委托约定。

### 类委托

```kotlin
class LoggingRepository(
    private val delegate: Repository<Task>
) : Repository<Task> by delegate
```

类委托减少样板代码，适合装饰器，但覆写行为要保持清晰。

### 运算符约定与解构

可通过 `operator fun plus`、`get/set`、`contains`、`invoke` 等约定定制语法。`component1()` 等支持解构。业务领域对象可适度使用，避免“看不懂的魔法”。

### DSL

带接收者的函数类型 `T.() -> Unit` 是 Kotlin DSL 核心：

```kotlin
class RequestBuilder {
    var url = ""
    fun header(name: String, value: String) { /* ... */ }
}

fun request(block: RequestBuilder.() -> Unit) = RequestBuilder().apply(block)

val req = request {
    url = "https://example.com"
    header("Accept", "application/json")
}
```

`@DslMarker` 可限制嵌套 DSL 中错误的外层接收者访问。

**练习**：编写一个 `html { body { text("Hello") } }` 的微型 DSL。

---

## 第 13 章：异常、Result 与资源管理

Kotlin 没有受检异常。`throw` 和 `try` 都是表达式：

```kotlin
val number = try {
    input.toInt()
} catch (e: NumberFormatException) {
    0
} finally {
    println("解析结束")
}
```

只捕获能处理的具体异常，不要静默吞掉 `Exception`。参数/状态校验：

```kotlin
require(age >= 0) { "年龄不能为负" }
check(isInitialized) { "尚未初始化" }
val value = requireNotNull(nullable)
```

自动关闭资源用 `use`：

```kotlin
val text = file.bufferedReader().use { it.readText() }
```

`runCatching { ... }` 返回 `kotlin.Result`，适合局部转换，但大型业务错误更适合显式密封类型，区分网络错误、认证错误、验证错误等。

```kotlin
sealed interface AppError {
    data object Offline : AppError
    data class Server(val code: Int) : AppError
}
```

**练习**：把不可靠的文本读取包装成明确的 Success/Failure 类型，而不是返回 null。

---

## 第 14 章：Java 互操作、注解与反射

Kotlin 可直接使用 Java 类。关键点：

- Java getter/setter 常表现为 Kotlin 属性。
- `@JvmStatic` 暴露静态风格方法，`@JvmField` 暴露字段，`@JvmOverloads` 为默认参数生成重载。
- Java 关键字冲突用反引号，如 `foo.`is`() `。
- `@Throws(IOException::class)` 向 Java 声明异常。
- SAM 接口可用 lambda：`view.setOnClickListener { ... }`。

```kotlin
class ApiClient @JvmOverloads constructor(
    val baseUrl: String,
    val timeout: Long = 5_000
) {
    companion object {
        @JvmStatic fun create() = ApiClient("https://example.com")
    }
}
```

注解可指定使用点：`@field:Inject`、`@get:JsonName`、`@param:Named`。Android 常见编译时代码生成由 KSP 驱动。反射使用 `::class`，但 Android 上需关注体积与性能，优先代码生成。

**练习**：写一个供 Java 调用的 Kotlin 工具类，并检查生成的方法签名。

---

## 第 15 章：协程与 Flow

协程是可挂起、非阻塞的并发任务。`suspend` 表示函数可挂起，只能从协程或另一个挂起函数调用。

```kotlin
suspend fun loadUser(id: Long): User = withContext(Dispatchers.IO) {
    api.fetchUser(id)
}

viewModelScope.launch {
    try {
        val user = loadUser(1)
        _uiState.value = UiState.Success(user)
    } catch (e: CancellationException) {
        throw e
    } catch (e: IOException) {
        _uiState.value = UiState.Error("网络不可用")
    }
}
```

### 核心概念

- `CoroutineScope` 定义生命周期；Android 使用 `viewModelScope`、`lifecycleScope`。
- `launch` 返回 `Job`，无结果；`async` 返回 `Deferred<T>`，通过 `await()` 取结果。
- `Dispatchers.Main` 更新 UI；`IO` 阻塞 I/O；`Default` CPU 密集计算。
- `withContext` 切换上下文并返回结果；不要用 `GlobalScope`。
- 取消是协作式的；挂起函数会检查取消，CPU 循环用 `ensureActive()`/`yield()`。
- `coroutineScope` 子任务失败会取消兄弟；`supervisorScope` 隔离子任务失败。
- `CoroutineExceptionHandler` 不是普通 `try/catch` 的替代品。

并行请求：

```kotlin
suspend fun dashboard() = coroutineScope {
    val user = async { api.user() }
    val news = async { api.news() }
    Dashboard(user.await(), news.await())
}
```

### Flow

`Flow<T>` 是冷数据流，每次收集重新执行。`StateFlow` 保存最新状态，`SharedFlow` 广播事件/数据。

```kotlin
val tasks: Flow<List<Task>> = dao.observeTasks()
    .map { entities -> entities.map(TaskEntity::toDomain) }
    .distinctUntilChanged()

val uiState: StateFlow<TaskUiState> = combine(tasks, query) { list, q ->
    TaskUiState(list.filter { q in it.title })
}.stateIn(
    scope = viewModelScope,
    started = SharingStarted.WhileSubscribed(5_000),
    initialValue = TaskUiState()
)
```

常用操作符：`map/filter/transform`、`debounce`、`combine`、`zip`、`flatMapLatest`、`catch`、`retry`、`onStart`、`flowOn`。UI 在 Compose 中使用生命周期感知的 `collectAsStateWithLifecycle()`。

一次性 UI 事件要谨慎建模：导航常由状态变化触发；必须广播时使用带缓冲策略的 `SharedFlow`，不要用容易丢失事件的临时布尔值。

**练习**：制作搜索流：输入防抖 300ms，最新查询取消旧请求，错误转为 UI 状态。

---

## 第 16 章：Android 项目与组件基础

典型模块：

```text
app/
  src/main/
    AndroidManifest.xml
    java/com/example/app/
    res/
  build.gradle.kts
```

Gradle Kotlin DSL 文件使用 `.gradle.kts`。版本集中到 version catalog 可减少重复。应用最重要的组件：

- `Activity`：一个用户可进入的界面容器；Compose App 常用单 Activity。
- `Service`：后台长任务入口；普通延迟任务优先 WorkManager，持续用户可感知任务使用前台服务。
- `BroadcastReceiver`：接收系统/应用广播，执行时间要短。
- `ContentProvider`：跨进程共享结构化数据。

Manifest 声明组件、权限和 App 配置。运行时危险权限必须在使用前解释并请求；不要请求业务不需要的权限。

### 生命周期

Activity 典型回调：`onCreate → onStart → onResume`；离开时 `onPause → onStop → onDestroy`。配置变化可能重建 Activity，UI 状态应放 ViewModel/持久层或使用可保存状态，而不是依赖 Activity 字段。

### Context 与 Intent

`Context` 访问资源和系统服务。Activity Context 带界面主题且受生命周期约束；Application Context 生命周期与进程一致。不要让单例长期持有 Activity/View 引用。

Intent 可显式启动应用内组件，也可隐式请求系统能力。跨组件数据应小而可序列化，大数据存数据库/文件并传 ID 或 URI。

**练习**：新建空 Compose 项目，观察生命周期日志；旋转屏幕后验证 ViewModel 状态仍在。

---

## 第 17 章：Jetpack Compose UI

Compose 用 Kotlin 函数声明 UI：

```kotlin
@Composable
fun TaskRow(
    task: Task,
    onToggle: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onToggle(task.id) }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(
            checked = task.done,
            onCheckedChange = { onToggle(task.id) }
        )
        Spacer(Modifier.width(12.dp))
        Text(task.title, style = MaterialTheme.typography.bodyLarge)
    }
}
```

### 核心规则

- Composable 可能频繁重组；函数应快速、无副作用、结果由参数和状态决定。
- `Modifier` 顺序会改变结果，调用方传入的 modifier 通常放最外层。
- 状态向下、事件向上：无状态组件接收值与回调，屏幕层连接 ViewModel。
- 列表使用 `LazyColumn`，为动态项提供稳定 `key`。

```kotlin
LazyColumn(contentPadding = PaddingValues(16.dp)) {
    items(tasks, key = Task::id) { task ->
        TaskRow(task, onToggle)
    }
}
```

### 状态与 remember

```kotlin
var query by rememberSaveable { mutableStateOf("") }
OutlinedTextField(value = query, onValueChange = { query = it })
```

- `remember` 跨重组保留，不能跨进程/通常不能跨 Activity 重建。
- `rememberSaveable` 保存 Bundle 可支持的少量 UI 状态。
- 业务状态属于 ViewModel/数据库，不应堆在 Composable。
- 对已有状态的派生计算用 `derivedStateOf`（仅在能减少无效更新时）。

### 副作用

- `LaunchedEffect(key)` 启动随 key 变化取消重启的协程。
- `DisposableEffect` 注册并清理监听。
- `SideEffect` 在成功重组后同步外部对象。
- `rememberUpdatedState` 在不重启 effect 的情况下读取最新回调。
- `produceState` 把异步源转为 Compose State。

### 主题、无障碍与适配

使用 Material 3 的颜色、排版、形状；支持深色模式和动态色。交互目标足够大，图片提供 `contentDescription`，自定义组件补充 semantics。使用 WindowSizeClass/自适应布局处理手机、平板和折叠屏；不要按固定像素设计。

**练习**：实现任务列表、空状态、加载状态、错误状态、搜索框与深色主题预览。

---

## 第 18 章：Navigation 与页面通信

Compose Navigation 用路由组织目的地。原则：只传 ID 等最小参数，在目标页面从数据层重新加载；不要把完整对象塞进路由。

```kotlin
@Composable
fun AppNavHost(navController: NavHostController) {
    NavHost(navController, startDestination = "tasks") {
        composable("tasks") {
            TaskListScreen(onOpen = { id -> navController.navigate("task/$id") })
        }
        composable(
            route = "task/{id}",
            arguments = listOf(navArgument("id") { type = NavType.LongType })
        ) { entry ->
            TaskDetailRoute(id = entry.arguments?.getLong("id") ?: return@composable)
        }
    }
}
```

项目允许时优先使用类型安全路由。处理返回栈、深链和恢复：

- 登录后清理登录页：`popUpTo` 配合 `inclusive`。
- 底部导航保存各 tab 状态并避免重复目的地。
- Deep Link 输入是不可信数据，必须验证参数与权限。
- 导航动作由屏幕边界处理，纯 UI 组件只发事件。

**练习**：实现列表→详情→编辑，保存后返回并让列表自动更新。

---

## 第 19 章：架构、ViewModel 与依赖注入

推荐分层（按复杂度裁剪）：

```text
UI (Compose + ViewModel)
        ↓
Domain（用例 + 领域模型，可选）
        ↓
Data（Repository + 本地/远程数据源）
```

单向数据流：ViewModel 暴露不可变 `StateFlow<UiState>`；UI 发送事件；ViewModel 调用用例/仓库并更新状态。

```kotlin
data class TaskUiState(
    val tasks: List<Task> = emptyList(),
    val loading: Boolean = false,
    val message: String? = null
)

sealed interface TaskAction {
    data class Toggle(val id: Long) : TaskAction
    data class Search(val text: String) : TaskAction
}

class TaskViewModel(
    private val repository: TaskRepository
) : ViewModel() {
    val state = repository.observeAll()
        .map { TaskUiState(tasks = it) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), TaskUiState(loading = true))

    fun onAction(action: TaskAction) {
        when (action) {
            is TaskAction.Toggle -> viewModelScope.launch { repository.toggle(action.id) }
            is TaskAction.Search -> Unit
        }
    }
}
```

### Repository 与单一事实源

Repository 隐藏数据来源。离线优先 App 通常让数据库成为单一事实源：UI 观察数据库；同步器从网络更新数据库，而不是同时让 UI 拼接两个来源。

### 依赖注入

构造器注入最易测试。大型 Android 项目可用 Hilt 管理对象图和生命周期；小项目可手工组装。不要把 Service Locator 当成无处不在的全局变量。

```kotlin
@HiltViewModel
class TaskViewModel @Inject constructor(
    private val repository: TaskRepository
) : ViewModel()
```

**练习**：把内存仓库注入 ViewModel，写 fake 替换真实实现，并验证状态变化。

---

## 第 20 章：网络、序列化与安全

常见组合是 HTTP 客户端/Retrofit + Kotlin 序列化或 Moshi。DTO、数据库实体和领域模型分离可隔离后端/存储变化。

```kotlin
@Serializable
data class TaskDto(
    val id: Long,
    val title: String,
    @SerialName("is_done") val done: Boolean
)

interface TaskApi {
    @GET("tasks")
    suspend fun tasks(): List<TaskDto>
}
```

Repository 负责映射与错误：

```kotlin
suspend fun refresh() {
    val remote = api.tasks()
    dao.replaceAll(remote.map(TaskDto::toEntity))
}
```

生产质量要求：

- 设置连接/读取超时；只对幂等请求谨慎重试并加退避。
- 区分无网、超时、HTTP 状态、解析失败和业务错误。
- 不在日志打印 token、密码和个人信息。
- 仅使用 HTTPS；密钥不能安全地硬编码在客户端，真正机密放服务端。
- 鉴权 token 使用合适的加密/系统凭据能力，处理过期刷新并避免并发刷新风暴。
- 分页使用 Paging；大文件使用流式读写并支持取消。

**练习**：用 Fake API 模拟 200、401、500、超时和格式错误，为每种情况产生明确 UI 状态。

---

## 第 21 章：Room、DataStore、文件与离线优先

### Room

```kotlin
@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey val id: Long,
    val title: String,
    val done: Boolean,
    val updatedAt: Long
)

@Dao
interface TaskDao {
    @Query("SELECT * FROM tasks ORDER BY updatedAt DESC")
    fun observeAll(): Flow<List<TaskEntity>>

    @Upsert
    suspend fun upsertAll(items: List<TaskEntity>)

    @Query("UPDATE tasks SET done = :done WHERE id = :id")
    suspend fun setDone(id: Long, done: Boolean)
}
```

数据库操作应离开主线程。版本升级必须提供 migration 并测试；生产应用不要用破坏性迁移丢用户数据。多步原子操作用 `@Transaction`。

### DataStore

Preferences DataStore 适合少量无模式设置；Proto DataStore 适合强类型配置。它们不是复杂关系数据的数据库。不要用旧式 SharedPreferences 承担新项目的响应式配置需求。

### 文件与 URI

应用私有文件无需存储权限。用户选择文档使用系统文件选择器和内容 URI；不要假设 URI 是真实文件路径。共享文件使用 FileProvider，不暴露 `file://`。

### 离线同步

写入先落本地并标记待同步；WorkManager 在网络可用时上传。需要设计冲突策略：最后写入胜出、字段合并、服务端版本号或人工处理。任务需幂等，避免重试造成重复记录。

**练习**：完成 Room CRUD，杀进程后数据仍存在；再为数据库写迁移测试。

---

## 第 22 章：后台任务、通知与系统集成

- **WorkManager**：可延迟、要求最终执行的约束任务，如同步、上传、清理。
- **前台服务**：用户明确感知且必须持续的工作，如导航/媒体；必须展示通知并遵守对应服务类型规定。
- **普通协程**：只在页面或进程生命周期内完成的任务。

```kotlin
val request = PeriodicWorkRequestBuilder<SyncWorker>(12, TimeUnit.HOURS)
    .setConstraints(Constraints(requiredNetworkType = NetworkType.CONNECTED))
    .build()

WorkManager.getInstance(context).enqueueUniquePeriodicWork(
    "task-sync",
    ExistingPeriodicWorkPolicy.KEEP,
    request
)
```

Worker 返回 `success/failure/retry`；重试需退避，输入输出数据应小。通知要创建 channel（支持的系统版本）、请求必要权限、提供有意义操作，并避免打扰。闹钟只用于用户可感知且时间精确的场景。

**练习**：添加网络约束的唯一同步任务，重复点击同步也不会排队多个实例。

---

## 第 23 章：测试、调试与质量

测试金字塔：大量快速单元测试，适量集成测试，少量关键 UI 测试。

```kotlin
class ToggleTaskUseCaseTest {
    @Test
    fun `toggle changes task state`() = runTest {
        val repo = FakeTaskRepository(Task(1, "Learn", false))
        ToggleTaskUseCase(repo)(1)
        assertTrue(repo.task.done)
    }
}
```

协程测试使用测试调度器和 `runTest`；Flow 可直接 `first()`、`take(n).toList()` 或使用合适测试工具。测试不要依赖真实时间和网络。

Compose 测试通过语义查找：

```kotlin
composeRule.onNodeWithText("学习 Kotlin").assertIsDisplayed()
composeRule.onNodeWithContentDescription("完成任务").performClick()
```

应覆盖：

- 领域规则和边界值。
- ViewModel 的 Loading/Success/Error 与取消。
- Repository 的缓存、映射、重试、离线与冲突。
- Room migration。
- 关键用户流程和无障碍语义。

调试时先稳定复现，再看堆栈最内层业务原因；使用结构化日志、断点、Profiler 和布局检查器。Release 构建也要测试，混淆和资源压缩可能引入差异。

**练习**：为搜索 ViewModel 写虚拟时间测试，证明防抖和取消旧请求都正确。

---

## 第 24 章：性能、安全、构建与发布

### 性能

- 不在主线程做网络、数据库或大型 JSON/图片处理。
- Compose 保持参数稳定、列表 key 稳定；先测量再用 `remember` 优化。
- 图片按显示尺寸加载，分页大列表，避免一次读入大文件。
- 用基准与启动分析定位真实瓶颈，不凭感觉“优化”。
- 关注冷启动、卡顿、内存泄漏、耗电和网络流量。

### 安全与隐私

- 最小权限；校验所有外部 Intent、深链、网络和文件输入。
- 敏感组件不应导出；确需导出时设置权限并验证调用方。
- 不提交签名文件、服务账号、真实密钥和用户数据到 Git。
- 日志与崩溃报告脱敏；提供隐私说明和数据删除路径。
- 依赖保持更新并检查已知漏洞，但升级先测试。

### 构建

区分 `debug/release` build type 与 `dev/prod` flavor。环境 URL 可通过 BuildConfig 或资源注入，但“隐藏在 App 中”的值都不能当服务端秘密。Release 开启合理的代码压缩，维护必要 keep 规则。

### 发布检查单

1. 唯一 applicationId、版本号、图标、名称、商店素材。
2. 生成并安全备份上传密钥；保留恢复方案。
3. 真机覆盖低版本、目标版本、深色、横屏、平板、弱网、无网和低内存。
4. 检查权限、隐私、安全表单、内容分级与目标 API 要求。
5. 先内部测试，再小比例发布，观察崩溃/ANR 和业务指标后扩量。
6. 建立回滚、热修复和数据迁移方案。

**练习**：生成 signed release，安装到真机并完成一次离线→联网同步全流程。

---

## 第 25 章：毕业项目——离线优先任务管理 App

### 功能验收

- 任务的新增、查看、编辑、删除、完成、搜索、筛选和排序。
- Room 持久化，重启/杀进程后不丢失。
- Compose Material 3，自适应列表/详情布局，深色主题和无障碍。
- ViewModel + StateFlow 单向数据流，Repository 隔离数据源。
- 模拟或真实 REST API，同步失败可重试、无网可继续编辑。
- WorkManager 后台同步，通知可选。
- 单元测试、Repository 集成测试、Room migration 测试、关键 UI 测试。
- Release 构建无敏感日志，README 说明架构、运行和权衡。

### 推荐结构

```text
com.example.tasks/
  app/                 # Application、导航、主题、DI
  feature/tasks/       # screen、component、ViewModel、UiState、Action
  domain/              # Task、Repository 接口、用例
  data/local/          # Room entity、DAO、database
  data/remote/         # API、DTO
  data/repository/     # Repository 实现、映射、同步
  worker/              # WorkManager
```

### 迭代计划

1. 先画数据流和页面状态；定义 `Task`、Repository 接口与 Fake。
2. 用 Fake 完成 Compose 列表/详情/编辑和导航。
3. 接入 Room，让数据库成为单一事实源。
4. 接入远程 API 和映射，设计错误模型。
5. 加入离线写入、同步队列、幂等和冲突策略。
6. 补测试、无障碍、平板布局、性能和发布配置。

### 完成定义

“能运行”不等于完成。每个功能必须有明确空/加载/错误/内容状态；旋转、返回、杀进程、无网、重复点击均行为正确；关键规则有自动化测试；另一位开发者只看 README 就能构建项目。

---

## 第 26 章：Gradle、项目配置与依赖管理

Android 工程不是“能编译就行”。你必须理解 Gradle、Android Gradle Plugin、Kotlin 插件、SDK 级别和依赖图，否则升级、打包与排错都会受阻。

### 三个 SDK 级别

- `minSdk`：允许安装的最低系统版本，决定可直接调用的 API 下限。
- `compileSdk`：编译时可见的 Android API；提高它本身不会改变运行行为。
- `targetSdk`：声明你已适配的行为规则；提高后会启用新系统的兼容性、安全和后台限制。

```kotlin
android {
    namespace = "com.example.tasks"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.example.tasks"
        minSdk = 26
        targetSdk = 36
        versionCode = 12
        versionName = "1.4.0"
    }
}
```

版本数字只是示意，创建真实项目时应检查当时的官方要求。`versionCode` 必须单调递增，`versionName` 面向用户。

### Version Catalog

用 `gradle/libs.versions.toml` 集中管理版本和别名：

```toml
[versions]
kotlin = "<current>"
compose-bom = "<current>"

[libraries]
compose-bom = { module = "androidx.compose:compose-bom", version.ref = "compose-bom" }
room-runtime = { module = "androidx.room:room-runtime", version = "<current>" }

[plugins]
android-application = { id = "com.android.application", version = "<current>" }
```

Compose BOM 只协调 Compose 组件版本，不会替你添加依赖。依赖应锁定并通过 Dependabot/Renovate 或定期人工升级；一次只升级一组相关组件，保留可回滚提交。

### Build Type、Flavor 与签名

```kotlin
android {
    buildTypes {
        debug { applicationIdSuffix = ".debug" }
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    flavorDimensions += "environment"
    productFlavors {
        create("dev") { dimension = "environment" }
        create("prod") { dimension = "environment" }
    }
}
```

不要把生产密钥写进 Gradle 文件。开发环境、生产环境要有不同的后端、应用名或图标时使用 flavor；不要用大量 flavor 制造无法测试的组合爆炸。

### 常见构建问题

- 依赖冲突：查看 dependency tree，找出重复/不兼容版本，不要盲目 `force`。
- KSP/Kotlin/AGP 不兼容：按各插件兼容矩阵成组升级。
- Release 才崩：检查 R8 keep 规则、反射、序列化和资源压缩。
- 构建慢：启用配置缓存与构建缓存，减少动态版本、注解处理和不必要模块依赖。

**练习**：建立 `devDebug` 与 `prodRelease`，让它们使用不同应用名与 API Base URL，并确认密钥未进入 Git。

---

## 第 27 章：资源、主题、国际化与配置变化

Android 资源系统用于文本、颜色、尺寸、图片、字体和多语言。即使采用 Compose，也不要把所有内容硬编码进 Kotlin。

```kotlin
Text(
    text = stringResource(R.string.task_count, count),
    color = MaterialTheme.colorScheme.primary
)
```

### 资源限定符

`values-zh-rCN`、`values-en` 用于语言；`drawable-night` 用于深色资源；传统 View 可用 `layout-sw600dp`。Compose 的整体布局更推荐根据当前窗口空间自适应，而不是按设备型号判断。

### 国际化检查

- 所有用户可见文本进入 `strings.xml`，不要拼接语序：使用占位符和复数资源。
- 日期、时间、数字、货币用 Locale 感知格式化，不假设小数点或年月日顺序。
- 支持从右到左布局；图标中“方向”与“含义”要区分。
- 文本膨胀 30%～50% 后仍能显示；不要固定文本容器高度。
- 用户在系统内为单个 App 选择语言时，状态应正确刷新。

```xml
<plurals name="task_count">
    <item quantity="one">%d task</item>
    <item quantity="other">%d tasks</item>
</plurals>
```

### 配置变化

旋转、窗口缩放、字体大小、语言、深色模式、键盘和折叠状态都可能触发重组或组件重建。业务数据放 Repository，屏幕状态放 ViewModel，可序列化的短暂输入用 `rememberSaveable`/`SavedStateHandle`。

**练习**：为任务 App 增加中英文、复数、深色主题和 200% 字体测试，确保没有截断。

---

## 第 28 章：进程、生命周期、状态恢复与内存

Android 进程随时可能在后台被系统终止。`Application`、单例、Activity 和 ViewModel 都不能当永久存储。

### 四类状态

| 状态 | 例子 | 保存位置 |
|---|---|---|
| UI 元素状态 | 输入框、滚动位置 | `rememberSaveable` / SavedState |
| 屏幕状态 | 筛选条件、加载结果 | ViewModel + `SavedStateHandle` |
| 业务数据 | 任务、账号、订单 | Room/文件/服务端 |
| 可重建缓存 | 图片、派生列表 | 内存缓存，可丢弃 |

`ViewModel` 能跨配置变化，但不能保证跨进程死亡。`SavedStateHandle` 只存恢复界面所需的小数据或 ID，大对象应写数据库。

```kotlin
class EditorViewModel(
    private val savedStateHandle: SavedStateHandle,
    private val repository: TaskRepository
) : ViewModel() {
    var draft by savedStateHandle.saveable { mutableStateOf("") }
        private set
}
```

### 生命周期感知收集

Compose 使用 `collectAsStateWithLifecycle()`；View 系统使用 `repeatOnLifecycle`。不要在 `onStart` 多次启动却不取消收集，也不要让 Activity 引用流入长生命周期对象。

### 内存泄漏排查

常见泄漏：单例持有 Activity、未注销监听、协程脱离 Scope、WebView/播放器未释放、静态集合保存 View。使用内存分析器观察 GC 后仍存活对象的引用链；修复所有权，而不是手动频繁调用 GC。

**练习**：开启开发者选项“不保留活动”，完成编辑草稿、跳转、旋转和返回；再模拟进程死亡验证关键状态可恢复。

---

## 第 29 章：Compose 深入——布局、修饰符、绘制与动画

### 测量与布局

Compose 中父节点把约束传给子节点，子节点选择尺寸并返回位置。避免在可滚动方向嵌套无界同向滚动；复杂布局可用 `Layout` 或 `SubcomposeLayout`，但先考虑标准组件。

```kotlin
@Composable
fun EqualWidthActions(actions: List<@Composable () -> Unit>) {
    Row(Modifier.fillMaxWidth()) {
        actions.forEach { action -> Box(Modifier.weight(1f)) { action() } }
    }
}
```

Modifier 顺序就是语义：`padding().clickable()` 和 `clickable().padding()` 的点击区域不同。可复用组件把调用方的 `modifier` 放在最外层，并提供合理默认值。

### 手势与输入

优先使用 `Button`、`clickable`、`scrollable` 等高层 API，它们已经处理语义、键盘、焦点和无障碍。只有自定义手势才用 `pointerInput`；手势协程的 key 必须代表应重启的依赖。

### 绘制

`Canvas`、`drawBehind`、`drawWithCache` 可实现图表和装饰。绘制只做像素工作；语义、点击区域和状态仍由 Composable 层提供。昂贵 Path/Shader 用 `drawWithCache` 缓存。

### 动画决策

- 单值变化：`animate*AsState`。
- 多属性同步：`updateTransition`。
- 内容出现/消失：`AnimatedVisibility`。
- 内容替换：`AnimatedContent`。
- 手势驱动物理动画：`Animatable`。
- 无限装饰动画：`rememberInfiniteTransition`，尊重“减少动画”需求。

动画不能阻断主要操作，测试中可使用可控时钟。避免在列表每项同时启动昂贵无限动画。

### 无障碍语义

```kotlin
IconButton(onClick = onDelete) {
    Icon(Icons.Default.Delete, contentDescription = stringResource(R.string.delete_task))
}
```

合并成一个逻辑控件时使用 `semantics(mergeDescendants = true)`；自定义控件提供角色、状态、操作和错误信息。用 TalkBack、键盘、开关控制和大字体真实测试。

**练习**：实现可拖动排序列表、删除撤销动画和自定义进度环，同时保证 TalkBack 能读出动作和状态。

---

## 第 30 章：Navigation 3、类型安全路由与返回栈

现代 Compose 项目可用 Navigation 3：返回栈就是由强类型 key 组成的可观察列表，`NavDisplay` 根据列表展示内容。这比字符串路由更易测试，也便于自适应多窗格。

```kotlin
@Serializable
sealed interface AppRoute : NavKey {
    @Serializable data object Tasks : AppRoute
    @Serializable data class TaskDetail(val id: Long) : AppRoute
}

val backStack = rememberNavBackStack(AppRoute.Tasks)

NavDisplay(
    backStack = backStack,
    onBack = { backStack.removeLastOrNull() },
    entryProvider = entryProvider {
        entry<AppRoute.Tasks> {
            TaskListScreen(onOpen = { backStack.add(AppRoute.TaskDetail(it)) })
        }
        entry<AppRoute.TaskDetail> { route -> TaskDetailScreen(route.id) }
    }
)
```

库 API 会演进，编码时以当前官方文档为准。核心思想不变：路由是稳定、可保存、可测试的数据；目的地只接收最小参数。

### 返回栈规则

- 登录成功后移除登录栈，避免返回到登录页。
- 底部导航为每个顶层目标维护状态，重复点击不重复压栈。
- 编辑页保存成功再返回；取消时若有草稿弹出确认。
- 系统预测性返回需要让转场与栈变化一致，不要自行拦截所有返回。

### Deep Link 与 App Link

Deep Link 是外部输入：验证 scheme、host、path、ID 和当前登录权限。Android App Links 通过网站上的 Digital Asset Links 验证域名归属；未验证链接可能交给浏览器。不要让深链绕过付费、账号或数据权限。

### 导航测试

把 back stack 操作封装为普通 Kotlin 状态，单元测试“打开、返回、登录重定向、深链解析”。UI 测试只验证关键目的地和系统返回。

**练习**：把旧字符串路由改为类型安全 route，实现深链 `https://example.com/tasks/{id}` 和登录后恢复目标页。

---

## 第 31 章：自适应布局、折叠屏、桌面窗口与 Edge-to-Edge

不要把“手机/平板”写成两个固定分支。窗口可以随分屏、旋转、折叠和桌面模式实时变化，布局应依据当前可用空间。

```kotlin
@Composable
fun AdaptiveTaskApp() {
    val info = currentWindowAdaptiveInfo()
    val expanded = info.windowSizeClass
        .isWidthAtLeastBreakpoint(WIDTH_DP_EXPANDED_LOWER_BOUND)

    if (expanded) TaskListDetailPane() else TaskSinglePane()
}
```

### 三种经典布局

- List-detail：消息、邮件、任务，宽屏同时展示列表和详情。
- Supporting pane：主内容旁放工具、属性或上下文。
- Feed：宽屏用不同尺寸网格组织卡片。

导航栏也要适应：窄屏底部栏，中等宽度 NavigationRail，宽屏可用抽屉。当前选中项和滚动位置不能因窗口变化丢失。

### 折叠与姿态

不要把重要控件放在铰链遮挡区。折叠/展开是运行时状态变化；保存选择项、草稿、播放器位置。可把双屏空间用于列表/详情或预览/控制，但普通宽屏也必须可用。

### Edge-to-Edge 与 Insets

内容可绘制到系统栏后，但交互元素必须避开状态栏、导航栏、刘海、圆角和输入法。使用 `WindowInsets`、`safeDrawingPadding`、`imePadding`，不要写死状态栏高度。

**练习**：在手机、600dp 分屏、840dp 宽屏和折叠姿态中运行任务 App，实现单窗格与双窗格无缝切换。

---

## 第 32 章：权限、隐私与系统选择器

权限流程是产品体验，不只是 API 调用。原则是“没有权限也尽量能用”，在用户触发功能时解释用途，然后请求最小权限。

```kotlin
val permissionLauncher = rememberLauncherForActivityResult(
    ActivityResultContracts.RequestPermission()
) { granted -> viewModel.onPermissionResult(granted) }
```

### 权限状态

- 未请求：在功能入口说明价值。
- 可请求：调用系统权限框。
- 拒绝但可再次请求：解释后允许用户重试，不要循环弹窗。
- 永久拒绝/策略限制：说明如何去设置，并提供无需权限的替代路径。
- 一次性或仅本次授权：每次实际使用前检查，不缓存“永远已授权”。

### 尽量使用无权限方案

- 选择图片/视频：系统 Photo Picker。
- 创建/打开文档：Storage Access Framework。
- 选择联系人或特定内容：系统 Pick 合约。
- 配对伴侣设备：Companion Device Manager。
- 拍一次照片：可调用系统相机并通过安全 URI 接收结果。

### 常见权限要点

- 通知在新系统上可能需要运行时授权；被拒绝后核心功能仍可工作。
- 精确/近似位置是用户选择；只有导航等确实需要时请求精确位置。
- 后台位置必须有持续、明显价值并满足商店政策，先获得前台位置。
- 蓝牙在 Android 12+ 按 Scan/Connect/Advertise 拆分，旧系统处理兼容声明。
- 媒体访问按图片、视频、音频和用户选择范围细分，避免读取整个媒体库。

**练习**：实现头像选择：优先 Photo Picker，无权限也能完成；为相机和通知分别设计拒绝后的 UI。

---

## 第 33 章：文件、图片、CameraX 与内容共享

### URI 不是文件路径

系统选择器返回 `content://` URI。通过 `ContentResolver.openInputStream()` 读取；不要把 URI 强转路径。若需长期访问，按合约持久化 URI 权限；若需编辑，复制到应用私有缓存并记录来源。

```kotlin
context.contentResolver.openInputStream(uri)?.use { input ->
    cacheFile.outputStream().use { output -> input.copyTo(output) }
}
```

### 图片加载

使用成熟图片库处理网络、缓存、采样、EXIF 和 Compose 集成。请求与显示尺寸匹配的图片；列表使用缩略图；失败、加载和占位状态要稳定，避免图片尺寸变化导致布局跳动。

### CameraX

CameraX 适合预览、拍照、录像和图像分析。绑定到生命周期，按设备能力组合 use case；分析帧必须及时关闭 `ImageProxy`，否则预览会停住。

```kotlin
imageAnalysis.setAnalyzer(executor) { image ->
    try { analyzer.process(image) }
    finally { image.close() }
}
```

相机页面要处理权限、镜头切换、旋转、闪光灯、前后台切换、存储失败与设备不支持。扫码结果属于不可信输入，打开 URL 前展示域名并校验 scheme。

### 分享与 FileProvider

共享应用私有文件使用 `FileProvider` 生成 `content://` URI，通过 Intent 临时授予读取权限。不要暴露 `file://`，也不要让 provider 路径覆盖整个内部目录。

**练习**：实现拍照→裁剪预览→保存→系统分享，旋转和切后台后流程仍正确。

---

## 第 34 章：Media3、音视频播放、MediaSession 与画中画

现代播放使用 Jetpack Media3，ExoPlayer 是默认 Player 实现。播放器是重资源对象，应由生命周期明确的持有者管理，而不是在每次重组中创建。

```kotlin
val player = remember(context) {
    ExoPlayer.Builder(context).build().apply {
        setMediaItem(MediaItem.fromUri(mediaUri))
        prepare()
    }
}
DisposableEffect(player) { onDispose { player.release() } }
```

生产项目通常把播放核心放入 Service/MediaSession，让锁屏、耳机、通知、Android Auto/TV 等控制端得到一致状态。页面通过 MediaController 控制，不直接与 Service 内部对象耦合。

### 音频焦点与中断

电话、导航提示和其他 App 会抢占焦点；按焦点类型暂停、降低音量或恢复。处理耳机拔出、蓝牙切换、网络中断、直播重连和音频变更。

### 视频与流媒体

支持 HLS/DASH、字幕、清晰度、播放速度、DRM、缓存和错误恢复。网络流不要无限重试；向用户提供明确重试和离线下载状态。

### 画中画

视频通话/播放可进入 PiP。进入前保证播放器状态独立于 Activity；提供播放、暂停等 RemoteAction；不适合的页面不要强行自动进入。

**练习**：实现播放列表、后台音频、媒体通知、锁屏控制、耳机拔出暂停和 PiP。

---

## 第 35 章：定位、地图与地理围栏

定位是高敏感能力。先问业务是否能使用用户手动选择城市或一次性地点；只有必要时请求位置。

### 位置请求设计

- 低频天气：低功耗、较大时间间隔即可。
- 导航/运动：更高精度和频率，但必须显示持续状态并管理耗电。
- 后台跟踪：明确用户价值、前台服务/通知、政策合规和停止入口。

```kotlin
val request = LocationRequest.Builder(
    Priority.PRIORITY_BALANCED_POWER_ACCURACY,
    30_000L
).setMinUpdateIntervalMillis(10_000L).build()
```

位置可能为空、陈旧、精度很差或被模拟。业务要显示精度/更新时间，并允许重试。不要把经纬度直接当地址；地理编码可能失败、受网络/配额影响。

### 地图

地图状态包括相机位置、选中标记、图层和加载状态。大量标记需要聚合；离线/弱网要有占位；API key 限制包名与签名证书，并设置配额。

### Geofence

地理围栏不是秒级精确触发器。处理延迟、设备重启、权限撤销和重复事件；事件写入幂等存储后再执行业务。

**练习**：实现地点收藏：地图选点、近似位置降级、无权限手动搜索、离开区域提醒。

---

## 第 36 章：蓝牙、NFC、传感器与连接状态

### BLE 状态机

BLE 不是“扫到就连接”。设计明确状态：Unsupported、BluetoothOff、PermissionRequired、Scanning、Connecting、DiscoveringServices、Ready、Disconnected、Error。

扫描耗电，限定时长并去重；连接可能在任何步骤断开；GATT 操作通常需要串行队列。根据系统版本申请正确的 Nearby Devices/位置权限，并只声明真正必需的硬件 feature。

### NFC

NDEF 适合读写标准标签；支付/门禁涉及更复杂安全协议，不能仅凭标签 ID 授权。处理 Activity 前台调度、重复扫描、无 NFC 设备和标签移开。

### 传感器

使用 SensorManager 时选择合适采样率，在 `onStop`/生命周期结束注销。传感器数据有噪声，需要滤波与校准；高频采样会耗电。健康数据优先使用平台健康数据接口与用户授权，不自建隐蔽采集。

### 连接状态

“有网络”不等于“互联网可用”，更不等于“服务器可用”。监听网络只用于优化体验，真实请求仍必须处理超时与失败。不要因连接回调连续触发而重复同步。

**练习**：为 BLE 温度计建立可测试状态机，模拟权限拒绝、设备断开、超时和自动重连。

---

## 第 37 章：登录、Credential Manager、Passkey 与生物认证

认证的最终可信来源在服务端。客户端负责安全地发起登录、保存会话、刷新 token 和展示状态，不能自行决定用户身份/权限。

### Credential Manager

Credential Manager 统一密码、Passkey 和联合登录入口。用户选择凭据后，客户端把结果发给服务端验证；异常分为用户取消、无可用凭据、配置错误和网络失败。

```kotlin
val credentialManager = CredentialManager.create(context)
val result = credentialManager.getCredential(context, request)
when (val credential = result.credential) {
    is PublicKeyCredential -> sendPasskeyResponseToServer(credential.authenticationResponseJson)
    is PasswordCredential -> signIn(credential.id, credential.password)
}
```

### Token 生命周期

- Access token 短期；Refresh token 受保护并支持轮换/撤销。
- 多请求同时遇到 401 时只允许一个刷新，其余等待结果。
- 刷新失败清理会话并回到登录状态，避免死循环。
- 日志、崩溃信息、分析事件和 URL 都不能包含 token。

### 生物认证

BiometricPrompt 适合确认本机用户后解锁敏感操作或加密密钥，不是服务端身份认证替代。设置设备凭据降级策略，处理无硬件、未录入、锁定和用户取消。

### 账号删除

登出只清本机凭据；账号删除必须由服务端完成并满足商店政策。删除后清除 Room、DataStore、文件、缓存、WorkManager、通知和推送 token。

**练习**：实现 Passkey/密码统一登录、单飞刷新、登出与账号删除的完整状态图和测试。

---

## 第 38 章：通知、FCM、App Links、快捷方式与小组件

### 通知

Channel 一经创建，其重要性通常由用户控制；按业务类别拆分，而不是每条通知一个 channel。通知点击使用不可变/可变要求正确的 PendingIntent，并验证其中参数。

### 推送

FCM token 会刷新，不是用户 ID。上传服务端时关联当前登录账号和设备记录；登出/删除账号时解除关联。消息可分为：

- Notification message：后台时系统可直接展示，控制较少。
- Data message：应用处理，受后台执行限制。

高优先级只用于时间敏感、用户可见的内容。收到推送后通常按 ID 拉取最新数据或触发幂等同步，不把推送载荷当完整事实源。

### App Links

为 HTTPS 域名部署 `assetlinks.json`，包含 applicationId 与签名证书指纹。Debug/Release 指纹不同；验证失败要检查重定向、Content-Type、缓存和域名范围。

### Shortcuts 与 Widget

动态快捷方式应反映最近/常用操作并设置稳定 ID。Widget 受空间、更新频率和交互模型限制；数据更新交给 Repository/WorkManager，不在更新回调中长时间阻塞。

**练习**：实现任务到期通知、推送同步、详情 App Link、最近任务快捷方式和“今日任务”小组件。

---

## 第 39 章：后台执行决策、WorkManager、前台服务与闹钟

先按任务语义选工具：

| 需求 | 工具 |
|---|---|
| 页面可见时执行 | 生命周期 Scope 中协程 |
| App 退出后仍需最终完成 | WorkManager |
| 用户正在感知的持续工作 | 对应类型前台服务 |
| 精确到特定时刻且用户明确期望 | AlarmManager（满足政策与权限） |
| 媒体播放 | MediaSessionService |

WorkManager 任务必须幂等，因为它可能重试。唯一任务避免重复排队；输入数据只放小参数，大数据放数据库/文件。

```kotlin
class SyncWorker(
    context: Context,
    params: WorkerParameters,
    private val sync: SyncRepository
) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result = try {
        sync.runOnce()
        Result.success()
    } catch (e: IOException) {
        Result.retry()
    } catch (e: UnauthorizedException) {
        Result.failure()
    }
}
```

前台服务必须有真实、持续且用户可感知的用途，声明正确 service type，及时发布通知并提供停止操作。Service 默认仍在主线程，阻塞工作要切换线程。

精确闹钟会影响电量且可能需要特殊授权，不应拿来做普通轮询。普通提醒接受系统批处理；服务器事件优先推送。

**练习**：为上传设计“页面内立即上传→失败落队列→WorkManager 约束重试→前台长上传”的决策与实现。

---

## 第 40 章：生产级网络——缓存、分页、上传、下载与实时通信

### HTTP 语义

GET 应幂等；POST 是否可重试取决于服务端是否支持幂等键。正确处理 2xx、304、400、401、403、404、409、422、429 和 5xx，不把所有错误都显示为“网络异常”。

缓存层可利用 ETag/If-None-Match、Cache-Control 和本地数据库。隐私数据不应被公共缓存；用户登出后清理账户范围缓存。

### 分页

Paging 负责加载状态、预取、重试和列表集成。网络+数据库使用 RemoteMediator：网络页写入 Room，UI 只观察 Room。分页 key 与数据更新放在同一事务，刷新时避免误删用户本地未同步数据。

### 上传下载

- 大文件分块/断点续传，记录 upload session 与已完成块。
- 使用流，不把整个文件读入内存。
- 展示真实进度，支持取消和恢复。
- 服务端验证 MIME、大小、扩展名和内容；客户端校验只为体验。
- 下载完成后校验长度/摘要，原子移动临时文件。

### WebSocket/SSE

连接是易失的：心跳、指数退避加随机抖动、前后台策略、token 更新、消息序号、去重和补拉缺失数据都要设计。实时消息仍应落到单一事实源。

### 可观测性

记录 request ID、耗时、状态类别和重试次数，但脱敏 URL/query/header/body。把用户错误文案与开发诊断信息分离。

**练习**：实现 Room + Paging + RemoteMediator，并为 429、断网、重复页、数据删除和刷新冲突写测试。

---

## 第 41 章：离线优先、同步协议与数据一致性

离线优先不是“加一层缓存”，而是完整的数据协议。

### 本地写模型

```kotlin
data class SyncMetadata(
    val localId: String,
    val serverId: String?,
    val version: Long?,
    val state: SyncState,
    val modifiedAt: Instant
)

enum class SyncState { SYNCED, PENDING_CREATE, PENDING_UPDATE, PENDING_DELETE, CONFLICT }
```

用户操作先在一个 Room 事务中更新业务记录和 outbox。同步器读取 outbox 发送，成功后更新 server ID/version 并删除事件。崩溃重启不会丢操作。

### 幂等与冲突

- Create 使用客户端生成 UUID/幂等键，重试不会重复创建。
- Update 携带已知 version/ETag，服务端检测并发修改。
- Delete 使用墓碑保留足够时间，避免旧设备重新上传“复活”。
- 简单字段可最后写入胜出；协作文档可能需要字段合并/CRDT；高价值冲突让用户选择。

### 时间不可全信

设备时钟可能错误。排序/冲突尽量使用服务端版本或逻辑时钟。客户端时间可用于 UI，但不能单独决定授权、订阅有效期和数据胜负。

### 数据库演进

每次 schema 变化提供 migration；备份历史 schema；用真实旧版本数据库跑迁移测试。远程 DTO、本地 Entity、Domain Model 分离，转换函数集中且有测试。

**练习**：实现 outbox 同步，模拟请求成功但响应丢失、双设备同时编辑、删除后旧设备上线三种情况。

---

## 第 42 章：应用内购买、订阅、广告与商业化

数字商品/订阅通常通过 Google Play Billing。客户端只负责展示产品和发起购买；最终权益应由可信服务端验证 purchase token 后授予。

### 购买状态机

Disconnected → Connecting → Ready → Launching → Pending/Purchased/Cancelled/Error。购买可能在 App 外完成，也可能跨设备完成，所以连接成功和 App 回前台时要查询未处理购买。

关键规则：

- 只在 `PURCHASED` 后授予权益，`PENDING` 仅展示等待。
- 服务端验证商品、包名、用户和 purchase token，防重复使用。
- 处理/确认购买，否则可能自动退款。
- 订阅包含续费、宽限期、暂停、恢复、升级降级、退款和撤销。
- 不缓存长期 `ProductDetails`；价格和优惠以 Play 返回的本地化数据为准。

### 广告

征得必要同意，限制个性化与儿童场景，避免把广告放在误触区域。广告 SDK 是数据供应链的一部分：审计权限、收集字段、网络域名、初始化时机和 Data Safety 声明。

### 商业伦理与体验

清晰展示价格、周期、试用转付费条件和取消入口。购买失败不能吞钱或重复扣款；提供“恢复购买”。物理商品/服务与数字内容的支付规则不同，发布前核对目标市场政策。

**练习**：用测试商品实现一次性商品和订阅，覆盖 Pending、取消、重复回调、跨设备恢复和服务端验证失败。

---

## 第 43 章：模块化、依赖边界与大型工程组织

不要因为“流行”一开始就拆几十个模块。模块化要解决构建隔离、团队边界、可复用和依赖约束。

```text
:app
:core:model
:core:designsystem
:core:database
:core:network
:core:testing
:feature:tasks:api
:feature:tasks:impl
:feature:settings
```

### 依赖规则

- `app` 负责组装和顶层导航，不放业务实现。
- feature 依赖 core 抽象，不相互随意引用。
- design system 不依赖具体 feature。
- data 实现依赖网络/数据库；domain 不依赖 Android 框架（若项目复杂度值得）。
- 用 `implementation` 隐藏内部依赖，缩小重新编译范围。

Convention Plugin 把共有 Android/Kotlin/Compose 配置封装在 `build-logic`，避免复制粘贴 Gradle 块。API/implementation 拆分只在确有编译隔离收益时使用。

### 何时拆模块

代码边界稳定、多人并行、独立测试/构建、可动态交付时拆。若跨模块 DTO 到处传播、循环依赖或每个修改都触及所有模块，说明边界不对。

**练习**：把任务 App 拆成 `app/core-model/core-database/feature-tasks`，画出允许的依赖方向并用构建规则阻止反向依赖。

---

## 第 44 章：全面测试——单元、集成、UI、截图与端到端

### 测试分层

1. 纯 Kotlin 单元：用例、验证、状态机、同步冲突。
2. 数据集成：Room DAO/migration、网络映射、Repository。
3. ViewModel：虚拟时间下的 StateFlow、取消、重试和 SavedState。
4. Compose UI：语义、交互、不同 UiState 与窗口宽度。
5. 端到端：登录、核心交易、恢复和升级等极少关键流程。

### 可控测试替身

Fake 实现真实行为，适合状态测试；Stub 返回固定结果；Mock 验证交互但容易与实现耦合。测试调度器替代真实延迟，Fake Clock/UUID/NetworkMonitor 保证确定性。

```kotlin
@Test
fun `new search cancels previous request`() = runTest {
    val api = ControllableSearchApi()
    val vm = SearchViewModel(api, backgroundScope)
    vm.onQuery("ko")
    advanceTimeBy(300)
    vm.onQuery("kotlin")
    advanceUntilIdle()
    assertEquals("kotlin", api.lastCompletedQuery)
}
```

### 截图与无障碍测试

截图测试固定字体、Locale、主题、系统栏和动画，覆盖 compact/medium/expanded。它发现视觉回归，但不能替代语义与行为断言。自动无障碍检查加真实 TalkBack 测试。

### 不稳定测试治理

禁止无条件 `sleep`；等待可观察状态。记录 seed、设备、系统版本和失败工件。隔离 flaky test 只是临时措施，必须指定负责人和截止时间。

**练习**：为毕业项目建立至少 30 个单元/集成测试、8 个 UI 场景和 6 个宽度/主题截图基准。

---

## 第 45 章：性能工程——启动、Compose、内存、网络与电量

性能必须先定义指标再测量。Debug、模拟器和首次 JIT 结果不能代表 Release 用户体验。

### 启动

- 减少 Application/onCreate 同步初始化；非首屏 SDK 延迟加载。
- 检查 ContentProvider 自动初始化。
- 使用 Startup tracing、Macrobenchmark 和 Baseline Profile。
- 首屏优先展示可用骨架/本地数据，不阻塞等所有远程请求。

### Compose

稳定 key、避免把频繁变化状态提升过高、把高频状态读取推迟到真正需要的阶段。`derivedStateOf` 只在输入变化频率明显高于输出时使用；`remember` 不是越多越快。

### 内存

观察 Java/Kotlin heap、Native、Graphics 和 Bitmap。大列表分页，图片按尺寸解码，缓存设置上限，流式处理大 JSON/文件。内存抖动通常来自循环中反复分配。

### 网络与电量

批量请求、压缩、条件缓存和指数退避；避免高频轮询、常驻定位和唤醒锁。用 Battery Historian/系统工具验证后台行为。

### ANR

主线程  I/O、锁竞争、Binder 慢调用、广播/Service 超时都可能 ANR。堆栈中主线程在“等谁”，再沿锁/调用链找根因。

**练习**：为冷启动和列表滚动写 Macrobenchmark，加入 Baseline Profile，记录优化前后 P50/P95。

---

## 第 46 章：安全工程——存储、网络、组件、WebView 与完整性

### 威胁建模

先列资产（账号、支付、私密内容）、攻击者、入口和影响，再选控制。不要用“加密了”概括安全。

### 本地数据

- 默认应用沙箱；敏感文件不放公共目录。
- Android Keystore 保存不可导出的密钥；密钥轮换与设备锁变化要有恢复策略。
- 不自行发明加密算法；使用经过审查的库和 AEAD。
- 截图/最近任务预览是否需要保护按页面风险决定，不要全局牺牲可用性。

### 网络

只用 HTTPS，生产关闭明文流量；证书固定会增加轮换和灾难恢复风险，只有威胁模型需要时采用备份 pin。服务端始终做授权，不能相信客户端隐藏按钮或本地角色字段。

### 组件与 IPC

显式设置 `android:exported`。导出组件验证调用者、权限和输入；PendingIntent 选择正确可变性并尽量显式；FileProvider 只暴露必要路径。

### WebView

非必要不启用 JavaScript/file access。仅加载受信域名，拦截导航，避免不安全 JS bridge，处理证书错误时绝不“继续”。第三方网页与原生身份之间建立最小桥接。

### 供应链与完整性

锁定依赖、审计 SDK、保护签名密钥、最小化 CI 权限。Play Integrity 信号由服务端结合风险使用，不应仅因设备不满足某信号就粗暴封禁所有用户。

**练习**：对登录、深链、文件分享和支付做威胁模型，并为每个风险写预防、检测和恢复措施。

---

## 第 47 章：隐私、数据治理与合规工程

隐私从数据流设计开始：收集什么、为何收集、存在哪里、共享给谁、保留多久、如何导出/删除。

### 数据清单

为每个字段记录：目的、法律/用户依据、敏感级别、保留期、第三方接收者、删除链路。SDK 采集也算你的 App 数据流。

### 最小化

- 分析事件不用真实姓名/邮箱作为 ID。
- 精度不需要时只存城市或近似位置。
- 本地计算能完成时不上传原始媒体/传感器数据。
- 日志短期保留并自动脱敏。

### 用户控制

权限前有上下文解释；设置页可关闭可选收集；提供数据导出、账号删除、撤回同意。删除请求要覆盖主库、缓存、对象存储、分析标识、推送 token 和下游处理者，并说明依法必须保留的数据。

### Data Safety

商店 Data Safety 必须与真实代码/SDK 行为一致。每次新增 SDK、权限、事件字段和新后端都触发隐私审查。不要把隐私政策当作“万能同意书”。

**练习**：为毕业项目画端到端数据流图，完成字段级数据清单与删除验收测试。

---

## 第 48 章：CI/CD、代码质量、签名与渐进发布

### 持续集成流水线

每个 Pull Request 执行：格式检查 → 静态分析 → 单元测试 → Lint → 构建 Debug/Release → 必要的设备测试。缓存 Gradle，但缓存 key 要包含 wrapper、catalog 与构建逻辑。

### 质量门禁

- 编译器警告逐步当错误处理。
- Android Lint、Detekt 等规则版本固定，抑制必须写原因。
- 依赖漏洞扫描和 license 检查。
- Release 产物执行签名、体积、敏感字符串和映射文件检查。

### 签名

上传密钥与 App signing key 概念分离。密钥不进仓库、不出现在普通 CI 日志；使用 CI secret/专用签名服务，限制读取人员并演练恢复。

### 发布策略

内部测试 → 封闭测试 → 小比例生产 → 扩量。观察 crash-free users、ANR、启动、关键转化和后端错误。数据库迁移、协议版本和 Feature Flag 必须支持旧客户端共存与回滚。

### 版本与变更

版本发布说明面向用户，Git tag/变更日志面向开发。重大功能用远程开关逐步开启，但开关服务失败时要有安全默认值。

**练习**：建立 GitHub Actions 流水线，PR 自动测试，tag 自动生成 AAB；签名和发布步骤仅在受保护环境运行。

---

## 第 49 章：Play Console、Android 16 与上线后运营

截至 2026 年，平台与商店要求仍会持续变化。2026 年 8 月 31 日起，Google Play 对普通新 App/更新要求 target Android 16（API 36）或更高；Wear/Automotive/TV/XR 有不同门槛。发布前必须重新核对官方页面，不能只依赖教程里的数字。

### 上架材料

- App 名、短/长描述、图标、截图、功能图、分类和联系信息。
- 隐私政策、Data Safety、内容分级、广告声明、目标年龄。
- 权限/后台位置/前台服务/健康/金融等专项声明。
- App Access：审核人员能进入登录后功能的测试账号和步骤。

### Android 16 适配重点

阅读行为变更清单，在真实 targetSdk 下测试。大屏上的方向、可调整大小和宽高比限制可能被系统忽略，因此必须做真正自适应布局；系统栏、返回、后台与权限行为也要在目标版本验证。

### Android Developer Verification

分发政策正加强开发者身份和应用注册。无论通过 Play 或其他渠道，都应维护可验证身份、包名、签名和分发记录，并以当前官方控制台要求为准。

### 上线后

建立 Crash/ANR 值班、用户反馈分类、服务端兼容期、紧急停用开关和修复发布流程。指标异常先判断是否与版本、设备、地区、系统或后端变更相关。

**练习**：用发布检查表完成一次 Internal Testing，邀请测试者安装、升级、回退业务开关并提交反馈。

---

## 第 50 章：传统 View/Fragment 互操作、KMP 与持续成长

### View 与 Compose 互操作

现有项目不会一夜迁移。可以在 Fragment/View 页面加入 `ComposeView`，设置与 ViewTree 生命周期匹配的 composition strategy；也可在 Compose 中用 `AndroidView` 承载地图、WebView 或暂未迁移的控件。

```kotlin
AndroidView(
    factory = { context -> LegacyChartView(context) },
    update = { view -> view.submitData(data) }
)
```

`factory` 只负责创建，`update` 同步当前状态。监听器要避免重复注册并在释放时清理。Fragment 仍需理解 view lifecycle 与 Fragment lifecycle 不同，绑定对象在 `onDestroyView` 清空。

### XML/View 核心补课

独立维护旧项目需要懂：ConstraintLayout、RecyclerView/ViewHolder/DiffUtil、ViewBinding、FragmentManager、Menu、传统 Navigation、主题/样式和自定义 View 的 measure/layout/draw/touch。迁移时以屏幕/组件为单位，保持数据层和测试不动。

### Kotlin Multiplatform

KMP 可共享网络、数据库、领域规则和状态管理，但 Android UI 仍可用 Compose。只有团队确有多平台需求时使用；共享“稳定业务逻辑”，不要为了共享而把平台体验抽成最低公分母。抽象时间、文件、网络、调度器等平台能力，并分别测试。

### 第二毕业项目：生产级内容 App

在任务 App 之后独立完成一个包含以下能力的 App：账号/Passkey、Paging、Room 离线同步、图片上传、推送/App Links、订阅、宽屏双窗格、后台任务、30+ 单元测试、性能基准、CI 和渐进发布。

验收时必须回答：

1. 数据单一事实源在哪里？进程死亡和离线如何恢复？
2. 每个长期任务为何选择协程、WorkManager 或前台服务？
3. 权限拒绝、登录过期、购买 Pending、上传中断如何降级？
4. 哪些数据离开设备？如何删除？密钥和权限边界在哪里？
5. 如何证明启动、滚动、内存、ANR 和无障碍达到目标？
6. 后端升级失败、数据库迁移失败或新版本崩溃时如何止损？

当你能在不依赖教程复制代码的情况下完成设计、实现、测试、发布和维护闭环，就真正具备了 Android 独立开发能力。

---

## Kotlin 语法速查

```kotlin
// 变量与空安全
val fixed: Int = 1
var changeable = 2
val nullable: String? = null
val length = nullable?.length ?: 0

// 表达式与类型检查
val result = if (fixed > 0) "yes" else "no"
val kind = when (val x: Any = "K") {
    is String -> x.length
    else -> 0
}

// 函数、默认参数、可变参数
fun add(a: Int, b: Int = 0) = a + b
fun sum(vararg values: Int) = values.sum()

// 类体系
data class User(val id: Long, val name: String)
sealed interface State { data object Loading : State }
object Singleton
@JvmInline value class UserId(val value: Long)

// 集合与高阶函数
val names = users.filter { it.id > 0 }.map(User::name)

// 扩展与泛型
fun String.nonBlankOrNull() = trim().takeIf(String::isNotEmpty)
inline fun <reified T> Any?.castOrNull(): T? = this as? T

// 协程与流
viewModelScope.launch { repository.refresh() }
val state = repository.observe().stateIn(viewModelScope, started, emptyList())
```

---

## 常见错误清单

1. 到处使用 `!!`；应建模可空性或提前返回。
2. 默认使用 `var` 和可变集合；应优先不可变数据与 `copy`。
3. 在 Composable 中直接发网络请求；应放进 ViewModel，并用 Effect 管理必要副作用。
4. 使用 `GlobalScope`；应绑定生命周期。
5. 捕获所有异常后不处理取消；协程中应重新抛出 `CancellationException`。
6. UI 同时把网络和数据库当事实源；离线优先时应观察数据库。
7. 导航传完整对象；应传 ID。
8. 单例持有 Activity；会造成内存泄漏。
9. 把 API key 写入 App 就认为安全；客户端内容都可被提取。
10. 只在模拟器和 Debug 测试；发布前必须覆盖真机与 Release。

---

## 独立开发能力自检

当你能不照抄教程完成以下内容，就具备独立开发基础：

- 能解释空安全、型变、扩展、内联、委托、协程取消和冷/热流。
- 能把页面拆成无状态 Composable，并设计完整 UiState/Action。
- 能用 ViewModel、Repository、Room、网络 API 建立可测试的数据流。
- 能处理生命周期、进程重建、权限、深链、离线和后台同步。
- 能写关键测试、定位 ANR/崩溃/泄漏、完成签名和发布检查。
- 遇到新库时能阅读官方文档、判断生命周期和线程模型，而不是只找复制代码。

最后建议：先完成一个小而完整的 App，再做第二个带登录、分页、上传和推送的 App。独立开发能力来自“完整交付闭环”，不是记住所有 API。

---

## 官方持续学习入口

Android API、商店规则和库版本会变化。实际编码时优先查官方文档，不照抄过期博客中的版本号：

- [Android App 架构指南](https://developer.android.com/topic/architecture)
- [Android 架构建议](https://developer.android.com/topic/architecture/recommendations)
- [Jetpack Compose](https://developer.android.com/develop/ui/compose)
- [Navigation 3](https://developer.android.com/guide/navigation/navigation-3)
- [Adaptive Apps](https://developer.android.com/develop/adaptive-apps)
- [后台任务与 WorkManager](https://developer.android.com/develop/background-work/background-tasks)
- [Android 安全清单](https://developer.android.com/privacy-and-security/security-tips)
- [Camera 与 Media](https://developer.android.com/media)
- [Credential Manager](https://developer.android.com/identity/sign-in/credential-manager)
- [Google Play Billing](https://developer.android.com/google/play/billing)
- [Google Play Target API 要求](https://developer.android.com/google/play/requirements/target-sdk)

阅读文档时重点看“Last updated”、最低/目标 SDK、行为变更、废弃 API、迁移指南和示例仓库。遇到库冲突先核对 release notes 与兼容矩阵。
